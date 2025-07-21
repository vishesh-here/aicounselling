export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { getRagContext } from "../rag-context/route";
import crypto from 'crypto';

function getSupabaseWithAuth(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  let globalHeaders: Record<string, string> = {};
  if (authHeader) {
    globalHeaders['Authorization'] = authHeader;
  } else {
    const cookieStore = cookies();
    globalHeaders['Cookie'] = cookieStore.toString();
  }
  // Use service role key for database operations to bypass RLS
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
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
      process.env.SUPABASE_SERVICE_ROLE_KEY!
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
      const conversationId = crypto.randomUUID();
      console.log('Creating new conversation with ID:', conversationId);
      
      const { data: newConv, error: convErr } = await supabase
        .from('ai_chat_conversations')
        .insert([
          {
            id: conversationId, // Explicitly provide ID
            sessionId: sessionId ?? null,
            child_id,
            volunteerId: user.id,
            conversationName: `Session Chat - ${new Date().toLocaleDateString()}`,
            isActive: true,
            context: null, // nullable, safe to set
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
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
    let ragContext: any = null;
    try {
      console.log('[DEBUG] About to call getRagContext...');
      console.log('[DEBUG] getRagContext function exists:', typeof getRagContext);
      console.log('[DEBUG] Calling getRagContext with params:', { child_id, sessionId, conversationId: conversation.id, message });
      
      ragContext = await getRagContext(supabase, child_id, sessionId, conversation.id, message);
      
      console.log('[DEBUG] getRagContext completed successfully');
      console.log('[DEBUG] getRagContext result:', ragContext ? 'Success' : 'Null/Empty');
      if (ragContext) {
        console.log('[DEBUG] RAG context keys:', Object.keys(ragContext));
      }
    } catch (err) {
      console.error("RAG context missing or incomplete:", err);
      console.error("Error details:", {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        name: err instanceof Error ? err.name : undefined
      });
      // Optionally, you could return an error here or proceed with fallback
    }

    // Save user message
    const userMessageId = crypto.randomUUID();
    console.log('Saving user message with ID:', userMessageId, 'to conversation:', conversation.id);
    
    const { error: userMsgErr } = await supabase
      .from('ai_chat_messages')
      .insert([
        {
          id: userMessageId, // Explicitly provide ID
          conversationId: conversation.id, // camelCase to match schema
          role: 'USER',
          content: message,
          timestamp: new Date().toISOString()
        }
      ]);

    if (userMsgErr) {
      console.error('Error saving user message:', userMsgErr);
    } else {
      console.log('User message saved successfully');
    }
    if (userMsgErr) {
      return NextResponse.json({ error: 'Failed to save user message', details: userMsgErr?.message }, { status: 500 });
    }

    // Generate AI response using comprehensive context
    const aiResponse = await generateAIResponse(message, ragContext, conversation);

    // Save AI response with RAG context
    const aiMessageId = crypto.randomUUID();
    console.log('Saving AI message with ID:', aiMessageId, 'to conversation:', conversation.id);
    console.log('AI response content:', aiResponse.content);
    
    const { error: aiMsgErr } = await supabase
      .from('ai_chat_messages')
      .insert([
        {
          id: aiMessageId, // Explicitly provide ID
          conversationId: conversation.id, // camelCase to match schema
          role: 'ASSISTANT',
          content: aiResponse.content,
          ragContext: ragContext,
          metadata: aiResponse.metadata,
          timestamp: new Date().toISOString()
        }
      ]);

    if (aiMsgErr) {
      console.error('Error saving AI message:', aiMsgErr);
    } else {
      console.log('AI message saved successfully');
    }
    if (aiMsgErr) {
      return NextResponse.json({ error: 'Failed to save AI message', details: aiMsgErr?.message }, { status: 500 });
    }

    // Extract and store important insights as conversation memory
    await extractAndStoreMemorySupabase(aiResponse.content, message, child_id, user.id, sessionId, supabase);

    return NextResponse.json({
      response: aiResponse.content,
      conversationId: conversation.id,
      metadata: aiResponse.metadata,
      ragContext: ragContext
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
    // (A) Log the RAG context before building the prompt
    console.log('[DEBUG] RAG context before prompt:', JSON.stringify(ragContext, null, 2));

    // Build comprehensive system prompt
    const systemPrompt = buildExpertSystemPrompt(ragContext);
    
    // (B) Log the constructed prompt string
    console.log('[DEBUG] System prompt for OpenAI:', systemPrompt);

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

    // (C) Log the full messages array sent to OpenAI
    console.log('[DEBUG] Messages array for OpenAI:', JSON.stringify(messages, null, 2));

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
  console.log('[buildExpertSystemPrompt] RAG context received:', {
    hasChildProfile: !!ragContext?.childProfile,
    activeConcernsCount: ragContext?.activeConcerns?.length || 0,
    sessionSummariesCount: ragContext?.sessionSummaries?.length || 0,
    knowledgeChunksCount: ragContext?.knowledgeChunks?.length || 0,
    knowledgeChunks: ragContext?.knowledgeChunks?.slice(0, 2) || []
  });

  if (!ragContext || !ragContext.childProfile) {
    // Fallback or error handling
    return "You are an expert AI mentor. The child profile/context is unavailable. Respond with general guidance.";
  }
  const child = ragContext.childProfile;
  const concerns = ragContext.activeConcerns || [];
  const sessionSummaries = ragContext.sessionSummaries || [];
  const knowledgeChunks = ragContext.knowledgeChunks || [];
  const latestRoadmap = ragContext.latestSessionRoadmap || null;

  // Serialize child profile
  const childProfileText = `Child Profile:\nName: ${child.name}\nAge: ${child.age}\nGender: ${child.gender}\nState: ${child.state}\nDistrict: ${child.district}\nBackground: ${child.background}\nSchool Level: ${child.schoolLevel}\nInterests: ${(child.interests || []).join(", ")}\nChallenges: ${(child.challenges || []).join(", ")}\nLanguage: ${child.language}`;

  // Serialize concerns
  const concernsText = concerns.length > 0
    ? concerns.map((c: any, i: number) => `Concern ${i + 1}:\n  Title: ${c.title}\n  Description: ${c.description}\n  Category: ${c.category}\n  Severity: ${c.severity}\n`).join("\n")
    : "No active concerns.";

  // Serialize session summaries
  const sessionSummariesText = sessionSummaries.length > 0
    ? sessionSummaries.map((s: any, i: number) => `Session Summary ${i + 1}:\n  Summary: ${s.summary}\n  Effectiveness: ${s.effectiveness}\n  Follow-up Notes: ${s.followup_notes}\n  Next Session Date: ${s.next_session_date}`).join("\n\n")
    : "No session summaries available.";

  // Serialize knowledge chunks (optional, can be summarized)
  const knowledgeText = knowledgeChunks.length > 0
    ? knowledgeChunks.slice(0, 3).map((k: any, i: number) => `Knowledge Chunk ${i + 1}: ${k.content}`).join("\n")
    : "No relevant knowledge base chunks found.";
  
  // Serialize latest roadmap
  const roadmapText = latestRoadmap
    ? `Latest Session Roadmap:\n${JSON.stringify(latestRoadmap, null, 2)}`
    : "No roadmap available for this session.";
  
  console.log('[buildExpertSystemPrompt] Knowledge text generated:', {
    knowledgeChunksLength: knowledgeChunks.length,
    knowledgeTextLength: knowledgeText.length,
    knowledgeTextPreview: knowledgeText.substring(0, 200) + '...',
    hasRoadmap: !!latestRoadmap
  });

  return `You are Dr. Priya Sharma, a world-class child psychologist with 20+ years of experience specializing in academic counseling and daily life guidance for children in India.\n\nBelow is the context for the child you are counseling. Use this information to provide highly personalized, empathetic, and actionable advice.\n\n${childProfileText}\n\nActive Concerns:\n${concernsText}\n\nSession Summaries:\n${sessionSummariesText}\n\nRelevant Knowledge Base Chunks:\n${knowledgeText}\n\n${roadmapText}\n\nAlways reference the child by name and tailor your advice to their background, challenges, and interests. If you need to make recommendations, be specific and culturally sensitive.`;
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
