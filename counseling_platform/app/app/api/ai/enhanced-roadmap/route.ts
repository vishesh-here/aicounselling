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
    // Try session-specific roadmap first
    let query = supabase
      .from('roadmaps')
      .select('*')
      .eq('child_id', child_id)
      .order('generated_at', { ascending: false })
      .limit(1);
    if (session_id) {
      query = query.eq('session_id', session_id);
    }
    let { data, error } = await query;
    
    // If not found, fallback to latest child-level roadmap
    if ((!data || data.length === 0) && session_id) {
      const fallback = await supabase
        .from('roadmaps')
        .select('*')
        .eq('child_id', child_id)
        .is('session_id', null)
        .order('generated_at', { ascending: false })
        .limit(1);
      data = fallback.data;
      error = fallback.error;
    }
    
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
      generated_by: roadmap.generated_by
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
    const { child_id, session_id } = body;
    
    console.log('Enhanced roadmap POST body:', { child_id, session_id });
    
    if (!child_id) {
      console.error('Missing child_id in request body');
      return NextResponse.json({ error: 'Missing child_id' }, { status: 400 });
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

    // Fetch past session summaries
    console.log('Fetching past session summaries...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id, startedAt, endedAt, status, sessionType')
      .eq('child_id', child_id)
      .order('startedAt', { ascending: false })
      .limit(5);

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
    }

    // Fetch session summaries for each session
    let sessionSummaries = [];
    if (sessions && sessions.length > 0) {
      for (const session of sessions) {
        try {
          const { data: summary, error: summaryError } = await supabase
            .from('session_summaries')
            .select('*')
            .eq('sessionid', session.id)
            .single();
          
          if (!summaryError && summary) {
            sessionSummaries.push({
              sessionId: session.id,
              date: session.startedAt,
              summary: summary.summary,
              effectiveness: summary.effectiveness,
              followup_notes: summary.followup_notes,
              new_concerns: summary.new_concerns,
              resolved_concerns: summary.resolved_concerns
            });
          }
        } catch (error) {
          console.error('Error fetching session summary:', error);
        }
      }
    }

    // Fetch knowledge base stories/frameworks relevant to child's concerns
    console.log('Fetching knowledge base stories...');
    let knowledgeBaseStories = [];
    try {
      // Get child's active concerns
      const activeConcerns = childData.concerns?.filter((c: any) => c.status !== 'RESOLVED') || [];
      
      if (activeConcerns.length > 0) {
        // Fetch stories from knowledge base that might be relevant
        const { data: stories, error: storiesError } = await supabase
          .from('knowledge_base')
          .select('*')
          .or(activeConcerns.map((c: any) => `category.eq.${c.category}`).join(','))
          .limit(10);

        if (!storiesError && stories) {
          knowledgeBaseStories = stories;
        }
      }
    } catch (error) {
      console.error('Error fetching knowledge base stories:', error);
    }

    // Build comprehensive context
    const context = `
COMPREHENSIVE CHILD PROFILE:
- Full Name: ${childData.fullName}
- Age: ${childData.dateOfBirth ? Math.floor((new Date().getTime() - new Date(childData.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : 'Unknown'} years old
- Gender: ${childData.gender}
- Location: ${childData.currentCity}, ${childData.state}
- Education: ${childData.currentClassSemester} at ${childData.currentSchoolCollegeName}
- Education Type: ${childData.educationType}
- Language: ${childData.language}
- Background: ${childData.background || "No background information"}
- Interests: ${Array.isArray(childData.interests) ? childData.interests.join(", ") : "None listed"}
- Family: Mother - ${childData.mothersName || "Not specified"}, Father - ${childData.fathersName || "Not specified"}
- Contact: ${childData.parentGuardianContactNumber}

ACTIVE CONCERNS (requiring immediate attention):
${childData.concerns?.filter((c: any) => c.status !== 'RESOLVED').map((concern: any) => 
  `- ${concern.category} (${concern.severity} severity): ${concern.title}
    Description: ${concern.description}
    Status: ${concern.status}`
).join("\n") || "No active concerns"}

PAST SESSION HISTORY (${sessionSummaries.length} sessions):
${sessionSummaries.map((summary: any, index: number) => 
  `Session ${index + 1} (${new Date(summary.date).toLocaleDateString()}):
  - Summary: ${summary.summary || "No summary available"}
  - Effectiveness: ${summary.effectiveness || "Not rated"}
  - Follow-up Notes: ${summary.followup_notes || "None"}
  - New Concerns Raised: ${summary.new_concerns ? summary.new_concerns.map((c: any) => typeof c === 'object' ? c.title : c).join(", ") : "None"}
  - Resolved Concerns: ${summary.resolved_concerns ? summary.resolved_concerns.join(", ") : "None"}`
).join("\n\n") || "No past sessions"}

RELEVANT KNOWLEDGE BASE STORIES/FRAMEWORKS:
${knowledgeBaseStories.map((story: any) => 
  `- ${story.title} (${story.category}): ${story.content.substring(0, 200)}...`
).join("\n") || "No relevant stories found"}

CULTURAL CONTEXT:
This child is from ${childData.state}, India. Consider the cultural background, family dynamics, and socio-economic context. The child's preferred language is ${childData.language}. Cultural sensitivity and trauma-informed approaches are essential.
`;

    const prompt = `You are an expert child counselor and psychologist specializing in working with underprivileged children in India. You understand trauma-informed care, cultural sensitivity, and age-appropriate counseling techniques.

${context}

Generate a comprehensive session roadmap that provides detailed, actionable guidance for a volunteer counselor. Your response MUST be a single valid, minified JSON object, and nothing else. Do not include any text before or after the JSON. Do not use markdown or code blocks. Use these exact keys:
- preSessionPrep (string)
- sessionObjectives (array of strings)
- warningSigns (array of strings)
- conversationStarters (array of strings)
- recommendedApproach (string)
- culturalContext (string)
- expectedChallenges (array of strings)
- successIndicators (array of strings)
- followUpActions (array of strings)
- recommendedStories (array of strings - suggest specific stories from the knowledge base that would be relevant)

IMPORTANT INSTRUCTIONS:
1. Base your recommendations on the child's past session history and progress
2. Suggest specific stories from the knowledge base that match the child's concerns and cultural background
3. Consider what worked/didn't work in previous sessions
4. Address any unresolved concerns from previous sessions
5. Build upon the child's interests and strengths identified in past sessions

Example:
{"preSessionPrep":"...","sessionObjectives":["..."],"warningSigns":["..."],"conversationStarters":["..."],"recommendedApproach":"...","culturalContext":"...","expectedChallenges":["..."],"successIndicators":["..."],"followUpActions":["..."],"recommendedStories":["Story Title 1", "Story Title 2"]}

Respond with valid, minified JSON only.`;

    // Compose the messages for OpenAI
    const messages = [
      { role: "system", content: "You are an expert roadmap generator for child counseling sessions. Use the following context to generate a detailed, actionable session roadmap." },
      { role: "user", content: `${prompt}\n\nRelevant Knowledge:\n${context}` },
    ];

    // Check if API key is available
    if (!OPENAI_API_KEY) {
      console.error('GENERIC_LLM_API_KEY not found, using fallback roadmap');
      // Return a fallback roadmap
      const fallbackRoadmap = {
        preSessionPrep: `Prepare a comfortable, safe environment for ${childData.fullName}. Have age-appropriate activities ready and ensure privacy for the session.`,
        sessionObjectives: [
          "Build trust and establish rapport",
          "Understand current challenges and concerns",
          "Identify strengths and interests",
          "Create a supportive action plan"
        ],
        warningSigns: [
          "Withdrawal or extreme shyness",
          "Expressions of hopelessness",
          "Physical symptoms without medical cause",
          "Sudden behavioral changes"
        ],
        conversationStarters: [
          "Tell me about your favorite activities or hobbies",
          "What makes you feel happy or proud?",
          "Is there anything that's been worrying you lately?",
          "What would you like to change or improve?"
        ],
        recommendedApproach: "Use a warm, empathetic approach with age-appropriate language. Focus on building trust through active listening and validation of feelings.",
        culturalContext: "Consider the child's cultural background and family dynamics. Respect traditional values while providing modern support approaches.",
        expectedChallenges: [
          "Initial shyness or reluctance to open up",
          "Language barriers if applicable",
          "Cultural differences in communication styles",
          "Limited attention span for younger children"
        ],
        successIndicators: [
          "Child shows comfort and willingness to engage",
          "Open sharing of thoughts and feelings",
          "Demonstration of understanding and hope",
          "Willingness to try suggested approaches"
        ],
        followUpActions: [
          "Schedule follow-up session within 1-2 weeks",
          "Share progress with family if appropriate",
          "Provide resources and activities for between sessions",
          "Monitor for any concerning changes"
        ],
        recommendedStories: [
          "Cultural story about resilience and family support",
          "Story about overcoming academic challenges"
        ]
      };

      // Save fallback roadmap to database
      if (!user?.id) {
        console.error('No authenticated user found for fallback roadmap');
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      
      const { error: insertError } = await supabase.from('roadmaps').insert({
        id: crypto.randomUUID(),
        child_id,
        session_id: session_id || null,
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

    // Call OpenAI API
    console.log('Calling OpenAI API with model:', OPENAI_MODEL);
    const openaiRes = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!openaiRes.ok) {
      const error = await openaiRes.text();
      console.error('OpenAI API error:', error);
      return NextResponse.json({ error: `OpenAI API error: ${error}` }, { status: 500 });
    }

    const data = await openaiRes.json();
    let roadmapContent = data.choices?.[0]?.message?.content || "";

    // Extract JSON object from the response using regex
    let jsonMatch = roadmapContent.match(/\{[\s\S]*\}/);
    let jsonString = jsonMatch ? jsonMatch[0] : roadmapContent;

    // Parse and structure the roadmap as JSON
    let parsedRoadmap = null;
    try {
      parsedRoadmap = JSON.parse(jsonString);
    } catch (e) {
      return NextResponse.json({ error: 'Failed to parse roadmap as JSON', raw: roadmapContent }, { status: 500 });
    }

        // Save roadmap to Supabase
    if (!user?.id) {
      console.error('No authenticated user found');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    console.log('Saving roadmap with generated_by:', user.id);
    const { error: insertError } = await supabase.from('roadmaps').insert({
      id: crypto.randomUUID(), // Generate text ID to match existing schema
      child_id,
      session_id: session_id || null,
      roadmap_content: parsedRoadmap,
      generated_by: user.id,
      generated_at: new Date().toISOString()
    });
    if (insertError) {
      console.error('Database error in enhanced-roadmap POST:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      roadmap: parsedRoadmap,
      generated_at: new Date().toISOString(),
      generated_by: user.id
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
}
