export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

function getSupabaseWithAuth(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  let globalHeaders: Record<string, string> = {};
  if (authHeader) {
    globalHeaders['Authorization'] = authHeader;
  } else {
    const cookieStore = cookies();
    globalHeaders['Cookie'] = cookieStore.toString();
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: globalHeaders } }
  );
}

export async function POST(request: NextRequest) {
  try {
    // Extract access token from Authorization header
    const authHeader = request.headers.get('authorization');
    let accessToken = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.replace('Bearer ', '');
    }
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    // Authenticate user using the access token
    let user = null;
    if (accessToken) {
      const { data, error } = await supabase.auth.getUser(accessToken);
      if (error || !data?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      user = data.user;
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, child_id, sessionId, conversationId } = await request.json();

    if (!message || !child_id) {
      return NextResponse.json({ error: "Message and child ID are required" }, { status: 400 });
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      const { data: foundConv } = await supabase
        .from('ai_chat_conversations')
        .select('*, messages:ai_chat_messages(*)')
        .eq('id', conversationId)
        .single();
      conversation = foundConv;
    }
    if (!conversation) {
      const { data: newConv, error: convErr } = await supabase
        .from('ai_chat_conversations')
        .insert([
          {
            sessionId: sessionId ?? null,
            child_id,
            volunteerId: user.id,
            conversationName: `Session Chat - ${new Date().toLocaleDateString()}`,
            isActive: true,
            context: null // nullable, safe to set
            // createdAt, updatedAt omitted (DB default)
          }
        ])
        .select('*')
        .single();
      if (convErr || !newConv) {
        console.error('Supabase error:', convErr);
        return NextResponse.json({ error: 'Failed to create conversation', details: convErr?.message }, { status: 500 });
      }
      conversation = newConv;
      conversation.messages = [];
    }

    // Build comprehensive RAG context
    const ragContextResponse = await fetch(`${process.env.INTERNAL_API_URL || "http://localhost:3000"}/api/ai/rag-context`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ child_id, sessionId, conversationId: conversation.id })
    });
    const ragContextJson = await ragContextResponse.json();
    const ragContext = ragContextJson.context;
    if (!ragContext || !ragContext.child) {
      console.error("RAG context missing or incomplete:", ragContextJson);
      // Optionally, you could return an error here or proceed with fallback
    }

    // Save user message
    const { error: userMsgErr } = await supabase
      .from('ai_chat_messages')
      .insert([
        {
          conversationId: conversation.id, // camelCase to match schema
          role: 'USER',
          content: message
        }
      ]);
    if (userMsgErr) {
      return NextResponse.json({ error: 'Failed to save user message', details: userMsgErr?.message }, { status: 500 });
    }

    // Generate AI response using comprehensive context
    const aiResponse = await generateAIResponse(message, ragContext, conversation);

    // Save AI response with RAG context
    const { error: aiMsgErr } = await supabase
      .from('ai_chat_messages')
      .insert([
        {
          conversationId: conversation.id, // camelCase to match schema
          role: 'ASSISTANT',
          content: aiResponse.content,
          ragContext: ragContext,
          metadata: aiResponse.metadata
        }
      ]);
    if (aiMsgErr) {
      return NextResponse.json({ error: 'Failed to save AI message', details: aiMsgErr?.message }, { status: 500 });
    }

    // Extract and store important insights as conversation memory
    await extractAndStoreMemorySupabase(aiResponse.content, message, child_id, user.id, sessionId, supabase);

    return NextResponse.json({
      response: aiResponse.content,
      conversationId: conversation.id,
      metadata: aiResponse.metadata
    });

  } catch (error) {
    console.error("Error in AI chat:", error);
    return NextResponse.json(
      { error: "Failed to process AI chat request" },
      { status: 500 }
    );
  }
}

async function generateAIResponse(userMessage: string, ragContext: any, conversation: any) {
  const startTime = Date.now();

  try {
    // Build comprehensive system prompt
    const systemPrompt = buildExpertSystemPrompt(ragContext);
    
    // Build conversation history
    const conversationHistory = conversation.messages?.map((msg: any) => ({
      role: msg.role.toLowerCase(),
      content: msg.content
    })) || [];

    // Prepare messages for LLM API
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-8), // Last 8 messages for context
      { role: "user", content: userMessage }
    ];

    // Call LLM API
    const response = await fetch("https://apps.abacus.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.ABACUSAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error("No response from LLM API");
    }

    const responseTime = Date.now() - startTime;

    return {
      content: aiContent,
      metadata: {
        responseTime,
        tokensUsed: data.usage?.total_tokens,
        contextSources: [
          "child_profile",
          "session_history", 
          "conversation_memories",
          "cultural_stories",
          "knowledge_base"
        ]
      }
    };

  } catch (error) {
    console.error("Error generating AI response:", error);
    throw error;
  }
}

function buildExpertSystemPrompt(ragContext: any): string {
  if (!ragContext || !ragContext.child) {
    // Fallback or error handling
    return "You are an expert AI mentor. The child profile/context is unavailable. Respond with general guidance.";
  }
  const child = ragContext.child;
  const sessionHistory = ragContext.sessionHistory;
  const memories = ragContext.conversationMemories;
  const stories = ragContext.relevantStories;
  const knowledge = ragContext.relevantKnowledge;

  return `You are Dr. Priya Sharma, a world-class child psychologist with 20+ years of experience specializing in academic counseling and daily life guidance for Indian children and adolescents. You are currently acting as an expert mentor and co-pilot to a volunteer counselor during an active counseling session.

## YOUR ROLE & EXPERTISE:
- **Primary Role**: Expert mentor providing real-time guidance to a volunteer counselor
- **Specialization**: Child psychology, academic stress, family dynamics, cultural sensitivity
- **Experience**: Extensive work with Indian children aged 8-18 across diverse socio-economic backgrounds
- **Approach**: Evidence-based psychological practices combined with cultural wisdom and empathy

## CURRENT CHILD CONTEXT:
**Child Profile:**
- Name: ${child.name} (${child.age} years old, ${child.gender})
- Location: ${child.state}${child.district ? `, ${child.district}` : ''}
- School Level: ${child.schoolLevel || 'Not specified'}
- Language: ${child.language}
- Background: ${child.background || 'Not specified'}

**Interests & Strengths:** ${child.interests?.join(', ') || 'None specified'}
**Current Challenges:** ${child.challenges?.join(', ') || 'None specified'}

**Active Concerns:**
${child.activeConcerns?.map((concern: any) => 
  `- ${concern.category}: ${concern.title} (${concern.severity}) - ${concern.description}`
).join('\n') || 'No active concerns recorded'}

## SESSION HISTORY CONTEXT:
${sessionHistory?.slice(0, 3).map((session: any, index: number) => 
  `**Session ${index + 1}** (${session.sessionType}):
  - Date: ${session.startedAt ? new Date(session.startedAt).toLocaleDateString() : 'Not started'}
  - Status: ${session.status}
  - Volunteer: ${session.volunteerName}
  ${session.summary ? `- Summary: ${session.summary.summary}
  - Progress: ${session.summary.progressMade || 'No progress recorded'}
  - Next Steps: ${session.summary.nextSteps?.join('; ') || 'No next steps recorded'}` : ''}
  ${session.notes ? `- Notes: ${session.notes}` : ''}`
).join('\n\n') || 'No previous sessions'}

## IMPORTANT CONVERSATION MEMORIES:
${memories?.slice(0, 8).map((memory: any) => 
  `- ${memory.type}: ${memory.content} (Importance: ${memory.importance}/5)`
).join('\n') || 'No conversation memories yet'}

## AVAILABLE CULTURAL RESOURCES:
${stories?.slice(0, 5).map((story: any) => 
  `- "${story.title}": ${story.summary} (Themes: ${story.themes?.join(', ')})`
).join('\n') || 'No relevant cultural stories available'}

## RELEVANT KNOWLEDGE BASE:
${knowledge?.slice(0, 5).map((kb: any) => 
  `- ${kb.title} (${kb.category}): ${kb.summary || 'Professional guidance material'}`
).join('\n') || 'No relevant knowledge base entries'}

## YOUR COMMUNICATION STYLE:
1. **Professional yet Warm**: Speak as an experienced mentor who cares deeply about both the child and the volunteer
2. **Culturally Sensitive**: Always consider Indian family dynamics, educational pressures, and cultural values
3. **Specific & Actionable**: Provide concrete, implementable advice rather than generic suggestions
4. **Evidence-Based**: Reference established psychological principles and techniques
5. **Contextual**: Always consider the specific child's history, personality, and current situation

## KEY GUIDELINES:
- **Immediate Support**: If the volunteer asks for urgent help (child is distressed, not responding, etc.), prioritize immediate, practical guidance
- **Technique Suggestions**: Recommend specific counseling techniques suitable for the child's age and situation
- **Cultural Integration**: When relevant, suggest cultural stories or values that might resonate with the child
- **Progress Monitoring**: Help the volunteer recognize signs of progress or areas needing attention
- **Safety First**: Always prioritize the child's emotional safety and well-being
- **Family Context**: Consider family dynamics and parental expectations in your guidance

## RESPONSE FORMAT:
- Keep responses concise but comprehensive (2-4 sentences typically)
- Start with empathy/validation of the volunteer's situation
- Provide 1-2 specific actionable suggestions
- Include relevant context from the child's history when applicable
- End with encouragement or a follow-up question to guide the volunteer

Remember: You are here to support the volunteer in real-time during an active session. Your guidance should be immediately applicable and culturally appropriate for this specific child's context.`;
}

// Refactored memory storage for Supabase
async function extractAndStoreMemorySupabase(
  aiResponse: string,
  userMessage: string,
  child_id: string,
  volunteerId: string,
  sessionId: string,
  supabase: any
) {
  try {
    const importantKeywords = [
      'breakthrough', 'progress', 'technique worked', 'effective approach',
      'warning sign', 'pattern', 'family context', 'cultural reference',
      'prefers', 'responds well', 'struggles with', 'breakthrough moment'
    ];
    const combinedText = `${userMessage} ${aiResponse}`.toLowerCase();
    const isImportant = importantKeywords.some(keyword => combinedText.includes(keyword));
    if (isImportant) {
      let memoryType = 'IMPORTANT_INSIGHT';
      let importance = 3;
      if (combinedText.includes('breakthrough') || combinedText.includes('progress')) {
        memoryType = 'BREAKTHROUGH_MOMENT';
        importance = 5;
      } else if (combinedText.includes('technique') || combinedText.includes('approach')) {
        memoryType = 'EFFECTIVE_TECHNIQUE';
        importance = 4;
      } else if (combinedText.includes('prefers') || combinedText.includes('responds well')) {
        memoryType = 'CHILD_PREFERENCE';
        importance = 4;
      } else if (combinedText.includes('warning') || combinedText.includes('struggles')) {
        memoryType = 'WARNING_SIGN';
        importance = 4;
      } else if (combinedText.includes('family') || combinedText.includes('cultural')) {
        memoryType = 'CULTURAL_REFERENCE';
        importance = 3;
      }
      await supabase.from('conversation_memories').insert([
        {
          child_id,
          volunteer_id: volunteerId,
          session_id: sessionId,
          memory_type: memoryType,
          content: `Volunteer: ${userMessage}\nAI Guidance: ${aiResponse}`,
          importance,
          associated_tags: extractTags(combinedText)
        }
      ]);
    }
  } catch (error) {
    console.error("Error storing conversation memory:", error);
  }
}

function extractTags(text: string): string[] {
  const tagKeywords = [
    'academic', 'family', 'emotional', 'behavioral', 'social',
    'anxiety', 'stress', 'motivation', 'confidence', 'communication'
  ];

  return tagKeywords.filter(tag => text.includes(tag));
}
