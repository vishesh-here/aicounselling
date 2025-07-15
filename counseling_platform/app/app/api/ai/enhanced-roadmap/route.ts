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
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { global: { headers: globalHeaders } });
}

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-4.1-nano";
const OPENAI_API_KEY = process.env.GENERIC_LLM_API_KEY;

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
    const supabase = getSupabaseWithAuth(request);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: No Supabase user found. Ensure you are logged in and that the request includes authentication cookies or headers." }, { status: 401 });
    }
    const body = await request.json();
    const { child_id, childProfile, activeConcerns, session_id } = body;

    // Enhanced context for AI
    const context = `
Child Profile:
- Name: ${childProfile.name}
- Age: ${childProfile.age}
- Location: ${childProfile.state}
- Interests: ${childProfile.interests?.join(", ") || "None listed"}
- Challenges: ${childProfile.challenges?.join(", ") || "None listed"}
- Background: ${childProfile.background || "No background information"}

Active Concerns (requiring immediate attention):
${activeConcerns?.map((concern: any) => 
  `- ${concern.category} (${concern.severity} severity): ${concern.title}
    Description: ${concern.description}`
).join("\n") || "No active concerns"}

This is a child from an underprivileged background in India. Cultural sensitivity and trauma-informed approaches are essential.
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

Example:
{"preSessionPrep":"...","sessionObjectives":["..."],"warningSigns":["..."],"conversationStarters":["..."],"recommendedApproach":"...","culturalContext":"...","expectedChallenges":["..."],"successIndicators":["..."],"followUpActions":["..."]}

Respond with valid, minified JSON only.`;

    // Compose the messages for OpenAI
    const messages = [
      { role: "system", content: "You are an expert roadmap generator for child counseling sessions. Use the following context to generate a detailed, actionable session roadmap." },
      { role: "user", content: `${prompt}\n\nRelevant Knowledge:\n${context}` },
    ];

    // Call OpenAI API
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
    const { error: insertError } = await supabase.from('roadmaps').insert({
      child_id,
      session_id: session_id || null,
      roadmap_content: parsedRoadmap,
      generated_by: user.id,
      generated_at: new Date().toISOString()
    });
    if (insertError) {
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
