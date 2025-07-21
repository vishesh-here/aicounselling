import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const dynamic = "force-dynamic";

function getSupabaseWithAuth(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  let globalHeaders: Record<string, string> = {};
  if (authHeader) {
    globalHeaders['Authorization'] = authHeader;
  } else {
    const cookieStore = cookies();
    globalHeaders['Cookie'] = cookieStore.toString();
  }
  // Use service role key directly for database operations
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

function getSupabaseForUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    // Create client with user's access token for authentication
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });
  } else {
    // Fallback to cookie-based auth
    const cookieStore = cookies();
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: {
        headers: {
          Cookie: cookieStore.toString()
        }
      }
    });
  }
}

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-4.1-nano";
const OPENAI_API_KEY = process.env.GENERIC_LLM_API_KEY;

// Check if API key is available
if (!OPENAI_API_KEY) {
  console.error('GENERIC_LLM_API_KEY environment variable is not set');
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseWithAuth(request);
    const { searchParams } = new URL(request.url);
    const child_id = searchParams.get('child_id');
    const session_id = searchParams.get('session_id');
    if (!child_id) {
      return NextResponse.json({ error: 'Missing child_id' }, { status: 400 });
    }
    
    // Always fetch the latest roadmap for this child (regardless of session_id)
    let { data, error } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('child_id', child_id)
      .order('generated_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Database error in enhanced-roadmap GET:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data || data.length === 0) {
      return NextResponse.json({ roadmap: null });
    }
    const roadmap = data[0];
    let parsedRoadmap = null;
    try {
      parsedRoadmap = typeof roadmap.roadmap_content === 'string' ? JSON.parse(roadmap.roadmap_content) : roadmap.roadmap_content;
    } catch (e) {
      parsedRoadmap = null;
    }
    return NextResponse.json({
      roadmap: parsedRoadmap,
      generated_at: roadmap.generated_at,
      generated_by: roadmap.generated_by,
      roadmap_id: roadmap.id,
      session_id: roadmap.session_id
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Enhanced roadmap POST request received');
    
    // Get user authentication first
    const userSupabase = getSupabaseForUser(request);
    let user = null;
    try {
      console.log('Attempting to get user from session...');
      const { data: { user: sessionUser }, error: userError } = await userSupabase.auth.getUser();
      user = sessionUser;
      if (user) {
        console.log('User authenticated:', user.id, user.email);
      } else {
        console.log('No user session found, userError:', userError);
      }
    } catch (error) {
      console.log('Error getting user session:', error);
    }
    
    // Use service role for database operations
    const supabase = getSupabaseWithAuth(request);

    const body = await request.json();
    const { child_id, session_id, action } = body;
    
    console.log('Enhanced roadmap POST body:', { child_id, session_id, action });
    
    if (!child_id) {
      console.error('Missing child_id in request body');
      return NextResponse.json({ error: 'Missing child_id' }, { status: 400 });
    }

    // If action is 'update_session', update existing roadmap with session_id
    if (action === 'update_session' && session_id) {
      console.log('Updating existing roadmap with session_id:', session_id);
      
      // Find the latest roadmap for this child
      const { data: existingRoadmap, error: findError } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('child_id', child_id)
        .order('generated_at', { ascending: false })
        .limit(1);
      
      if (findError || !existingRoadmap || existingRoadmap.length === 0) {
        return NextResponse.json({ error: 'No roadmap found to update' }, { status: 404 });
      }
      
      // Update the roadmap with session_id
      const { error: updateError } = await supabase
        .from('roadmaps')
        .update({ session_id: session_id })
        .eq('id', existingRoadmap[0].id);
      
      if (updateError) {
        console.error('Error updating roadmap with session_id:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Roadmap updated with session ID',
        roadmap_id: existingRoadmap[0].id
      });
    }

    // Fetch comprehensive child data from database
    console.log('Fetching comprehensive child data...');
    const { data: childData, error: childError } = await supabase
      .from('children')
      .select('*, assignments(*, volunteer:users(id, name, specialization)), concerns(*), sessions(*, volunteer:users(id, name))')
      .eq('id', child_id)
      .eq('isActive', true)
      .single();

    if (childError || !childData) {
      console.error('Error fetching child data:', childError);
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // Fetch sessions for this child
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id, startedAt, endedAt, status, sessionType')
      .eq('child_id', child_id)
      .order('startedAt', { ascending: false })
      .limit(5);

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
    } else {
      console.log(`Sessions query for child ${child_id}:`, sessions?.length || 0, 'sessions found');
    }

    // Fetch session summaries for each session
    let sessionSummaries = [];
    if (sessions && sessions.length > 0) {
      console.log(`Found ${sessions.length} sessions for child ${child_id}:`, sessions.map(s => ({ id: s.id, startedAt: s.startedAt })));
      
      for (const session of sessions) {
        try {
          console.log(`Fetching summary for session ${session.id}...`);
          const { data: summary, error: summaryError } = await supabase
            .from('session_summaries')
            .select('*')
            .eq('sessionid', session.id)
            .single();
          
          if (summaryError) {
            console.error(`Error fetching summary for session ${session.id}:`, summaryError);
          } else if (summary) {
            console.log(`Found summary for session ${session.id}:`, summary.summary?.substring(0, 100) + '...');
            sessionSummaries.push({
              sessionId: session.id,
              date: session.startedAt,
              summary: summary.summary,
              effectiveness: summary.effectiveness,
              followup_notes: summary.followup_notes,
              new_concerns: summary.new_concerns,
              resolved_concerns: summary.resolved_concerns
            });
          } else {
            console.log(`No summary found for session ${session.id}`);
          }
        } catch (error) {
          console.error('Error fetching session summary:', error);
        }
      }
    } else {
      console.log(`No sessions found for child ${child_id}`);
    }
    
    console.log(`Total session summaries found: ${sessionSummaries.length}`);

    // Fetch knowledge base stories/frameworks relevant to child's concerns
    console.log('Fetching knowledge base stories using vector search...');
    let knowledgeBaseStories = [];
    try {
      // Get active concerns to find relevant stories
      const activeConcerns = childData.concerns?.filter((c: any) => c.status !== "RESOLVED") || [];
      
      if (activeConcerns.length > 0) {
        console.log('Active concerns for story matching:', activeConcerns.map((c: any) => `${c.category}: ${c.title}`));
        
        // Create a comprehensive semantic query from concerns AND session summaries
        const concernText = activeConcerns.map((c: any) => `${c.title} ${c.description || ''}`).join(' ');
        
        // Include session summaries for richer context
        const sessionSummaryText = sessionSummaries.length > 0 
          ? sessionSummaries.map((s: any) => s.summary).join(' ')
          : '';
        
        const queryText = `counseling guidance for child with concerns: ${concernText} ${
          sessionSummaryText ? `Previous session discussions: ${sessionSummaryText}` : ''
        }`;
        
        console.log('Semantic query for vector search:', queryText.substring(0, 200) + '...');
        
        // Generate embedding for the comprehensive query
        const { OpenAI } = await import("openai");
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        const embeddingResponse = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: queryText
        });
        
        const embedding = embeddingResponse.data[0].embedding;
        
        // Use vector similarity search to find relevant document chunks
        const { data: relevantChunks, error: vectorError } = await supabase.rpc(
          'match_document_chunks',
          {
            query_embedding: embedding,
            match_count: 10
          }
        );
        
        if (vectorError) {
          console.error('Vector search error:', vectorError);
        } else if (relevantChunks && relevantChunks.length > 0) {
          console.log(`Found ${relevantChunks.length} relevant chunks via vector search`);
          
          // Debug: Log the structure of the first chunk
          console.log('First chunk structure:', JSON.stringify(relevantChunks[0], null, 2));
          
          // Get unique story IDs from the chunks
          const storyIds = [...new Set(relevantChunks.map((chunk: any) => chunk.knowledgeBaseId).filter(Boolean))];
          
          console.log('Extracted story IDs:', storyIds);
          
          if (storyIds.length > 0) {
            // Fetch the actual story details
            const { data: stories, error: storiesError } = await supabase
              .from('knowledge_base')
              .select('*')
              .in('id', storyIds)
              .order('createdAt', { ascending: false });
            
            console.log('Database query result:', { stories, storiesError });
            
            if (!storiesError && stories) {
              knowledgeBaseStories = stories;
              console.log(`Retrieved ${stories.length} stories from vector search results`);
            } else {
              console.log('Error fetching stories from database:', storiesError);
            }
          } else {
            console.log('No story IDs found in chunks, checking alternative metadata fields...');
            // Try alternative metadata field names
            const alternativeStoryIds = [...new Set(relevantChunks.map((chunk: any) => 
              chunk.metadata?.knowledge_base_id || 
              chunk.metadata?.document_id || 
              chunk.metadata?.id ||
              chunk.metadata?.story_id
            ).filter(Boolean))];
            console.log('Alternative story IDs:', alternativeStoryIds);
          }
        }
      }
      
      // Fallback: If no stories found via vector search, get some general stories
      if (knowledgeBaseStories.length === 0) {
        console.log('No stories found via vector search, fetching general stories as fallback');
        const { data: generalStories, error: generalError } = await supabase
          .from('knowledge_base')
          .select('*')
          .limit(5)
          .order('createdAt', { ascending: false });
        
        if (!generalError && generalStories) {
          knowledgeBaseStories = generalStories;
        }
      }
      
    } catch (error) {
      console.error('Error fetching knowledge base stories:', error);
    }

    // Build comprehensive context for AI
    const context = `
CHILD PROFILE:
- Name: ${childData.fullName}
- Age: ${childData.age} years
- Gender: ${childData.gender}
- State: ${childData.state}
- Background: ${childData.background || 'No background information'}
- Interests: ${childData.interests?.join(', ') || 'None listed'}
- Challenges: ${childData.challenges?.join(', ') || 'None listed'}

CURRENT ACTIVE CONCERNS:
${childData.concerns?.filter((c: any) => c.status !== "RESOLVED").map((concern: any) => 
  `- ${concern.category} (${concern.severity}): ${concern.title} - ${concern.description}`
).join('\n') || 'No active concerns'}

RESOLVED CONCERNS (for context):
${childData.concerns?.filter((c: any) => c.status === "RESOLVED").map((concern: any) => 
  `- ${concern.category}: ${concern.title} - ${concern.description}`
).join('\n') || 'No resolved concerns'}

RECENT SESSION HISTORY (Last 5 sessions):
${sessionSummaries.map((summary: any, index: number) => 
  `Session ${index + 1} (${new Date(summary.date).toLocaleDateString()}):
  Summary: ${summary.summary}
  Effectiveness: ${summary.effectiveness}
  Follow-up Notes: ${summary.followup_notes}
  New Concerns: ${summary.new_concerns || 'None'}
  Resolved Concerns: ${summary.resolved_concerns || 'None'}`
).join('\n\n') || 'No previous sessions'}

AVAILABLE KNOWLEDGE BASE STORIES (Use these EXACT titles in recommendedStories):
${knowledgeBaseStories.map((story: any) => 
  `"${story.title}" - ${story.content.substring(0, 150)}...`
).join('\n') || 'No relevant stories found'}

Based on this comprehensive information, generate a focused, actionable session roadmap.
`;

    const prompt = `You are an expert child counselor. Generate a concise, practical session roadmap.

${context}

Create a focused roadmap that directly addresses the child's current situation. Your response MUST be a single valid JSON object with these exact keys:

- sessionSummary (string - brief summary of what was discussed in previous sessions)
- activeConcerns (array - list the current active concerns that need attention)
- sessionFocus (string - what should be the main focus of this session)
- keyQuestions (array of 3-4 specific questions to ask based on concerns)
- warningSigns (array of 2-3 specific warning signs to watch for)
- nextSteps (array of 2-3 concrete next steps for this session)
- recommendedStories (array of story titles to recommend from the knowledge base)

CRITICAL RULES:
- Keep everything brief and actionable
- Directly mention the child's specific concerns by name
- Reference what was actually discussed in previous sessions
- Focus on immediate, practical actions
- Avoid generic advice - be specific to this child's situation
- For recommendedStories: ONLY use the EXACT titles in quotes from the "AVAILABLE KNOWLEDGE BASE STORIES" section above
- Do NOT create generic story titles - use the actual titles provided
- If no stories are available, use ["No stories available in knowledge base"]

Respond with valid JSON only.`;

    try {
      // Use OpenAI instead of Gemini for better reliability
      const { OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert child counselor. Generate concise, practical session roadmaps in valid JSON format only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const generatedText = completion.choices[0].message.content;
      
      if (!generatedText) {
        throw new Error('No response generated from OpenAI');
      }
      
      // Extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      let roadmapData = JSON.parse(jsonMatch[0]);
      
      // Map recommended story titles to full story objects
      if (roadmapData.recommendedStories && Array.isArray(roadmapData.recommendedStories)) {
        const storyTitles = roadmapData.recommendedStories;
        const fullStories = [];
        
        for (const title of storyTitles) {
          // Find the story in our knowledge base
          const story = knowledgeBaseStories.find((s: any) => s.title === title);
          if (story) {
            fullStories.push({
              id: story.id,
              title: story.title,
              summary: story.summary,
              content: story.content,
              category: story.category,
              source: story.source,
              themes: story.themes,
              applicableFor: story.applicableFor,
              moralLesson: story.moralLesson,
              keyInsights: story.keyInsights,
              createdAt: story.createdAt,
              createdBy: story.createdBy
            });
          }
        }
        
        roadmapData.recommendedStories = fullStories;
      }

      // Save roadmap to database
      const { data: savedRoadmap, error: saveError } = await supabase
        .from('roadmaps')
        .upsert({
          id: crypto.randomUUID(),
          child_id: child_id,
          session_id: session_id || null,
          roadmap_content: roadmapData,
          generated_by: user?.id || null
        })
        .select()
        .single();

      if (saveError) {
        console.error('Error saving roadmap:', saveError);
        return NextResponse.json({ error: 'Failed to save roadmap' }, { status: 500 });
      }

      return NextResponse.json({ 
        roadmap: roadmapData,
        id: savedRoadmap.id 
      });

    } catch (error) {
      console.error('Error generating roadmap:', error);
      
      // Fallback roadmap with full story data
      const fallbackRoadmap = {
        sessionSummary: "No previous sessions found for this child.",
        activeConcerns: childData.concerns?.filter((c: any) => c.status !== "RESOLVED").map((c: any) => c.title) || ["No active concerns identified"],
        sessionFocus: "Establish rapport and understand the child's current situation and needs.",
        keyQuestions: [
          "How are you feeling today?",
          "What would you like to talk about?",
          "Is there anything that's been on your mind lately?"
        ],
        warningSigns: [
          "Withdrawal from activities",
          "Changes in behavior or mood"
        ],
        nextSteps: [
          "Build trust and rapport",
          "Assess current concerns",
          "Plan follow-up actions"
        ],
        recommendedStories: knowledgeBaseStories.length > 0 
          ? knowledgeBaseStories.slice(0, 3).map((story: any) => ({
        id: story.id,
        title: story.title,
        summary: story.summary,
              content: story.content,
              category: story.category,
              source: story.source,
        themes: story.themes,
              applicableFor: story.applicableFor,
              moralLesson: story.moralLesson,
              keyInsights: story.keyInsights,
              createdAt: story.createdAt,
              createdBy: story.createdBy
            }))
          : [{ id: "no-stories", title: "No stories available in knowledge base", summary: "No stories found" }]
      };

      // Save fallback roadmap to database (always child-level)
      if (!user?.id) {
        console.error('No authenticated user found for fallback roadmap');
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      
      const { error: insertError } = await supabase.from('roadmaps').insert({
        id: crypto.randomUUID(),
        child_id,
        session_id: null, // Always child-level
        roadmap_content: fallbackRoadmap,
        generated_by: user.id,
        generated_at: new Date().toISOString()
      });

      if (insertError) {
        console.error('Database error saving fallback roadmap:', insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

    return NextResponse.json({
      success: true,
        roadmap: fallbackRoadmap,
        generated_at: new Date().toISOString(),
        generated_by: user.id,
        note: "Using fallback roadmap due to missing API key"
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
}
