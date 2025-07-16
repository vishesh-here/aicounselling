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

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseWithAuth(request);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { childProfile, activeConcerns, recentSessions } = body;

    // Fetch RAG context (relevant knowledge chunks)
    const authHeader = request.headers.get("authorization");
    const ragRes = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/ai/rag-context`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {})
      },
      body: JSON.stringify({ child_id: childProfile.id })
    });
    let ragChunks = [];
    if (ragRes.ok) {
      const ragData = await ragRes.json();
      ragChunks = ragData.context?.relevant_knowledge_chunks || [];
    }

    // Prepare context for AI
    const context = `
Child Profile:
- Name: ${childProfile.name}
- Age: ${childProfile.age}
- Interests: ${childProfile.interests?.join(", ") || "None listed"}
- Challenges: ${childProfile.challenges?.join(", ") || "None listed"}
- Background: ${childProfile.background || "No background information"}

Active Concerns:
${activeConcerns?.map((concern: any) => 
  `- ${concern.category} (${concern.severity}): ${concern.title}`
).join("\n") || "No active concerns"}

Recent Session History:
${recentSessions?.map((session: any, index: number) => 
  `Session ${index + 1}: ${session.summary || "No summary"} (Status: ${session.resolutionStatus || "Unknown"})`
).join("\n") || "No previous sessions"}

Relevant Knowledge Chunks:
${ragChunks.map((chunk: any, idx: number) => `Chunk ${idx + 1}: ${chunk.content}`).join("\n") || "No relevant knowledge found"}

Based on this information, provide a counseling session roadmap for this child.
`;

    const prompt = `You are an expert child counselor specializing in counseling underprivileged children in India. 

${context}

Please generate a comprehensive session roadmap that includes:

1. Session Focus: What should be the primary focus of the upcoming session?
2. Primary Goals: 3-4 specific, achievable goals for this session
3. Recommended Approach: 3-4 counseling techniques or approaches that would be most effective

Consider the child's age, cultural background, and current concerns. Provide practical, culturally-sensitive recommendations that a volunteer counselor can implement.

Respond with raw JSON only. Do not include code blocks, markdown, or any other formatting.`;

    const response = await fetch("https://apps.abacus.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API request failed: ${response.statusText}`);
    }

    const aiResponse = await response.json();
    let roadmapContent = aiResponse.choices?.[0]?.message?.content;

    if (!roadmapContent) {
      throw new Error("No content received from AI");
    }

    // Clean and parse the JSON response
    try {
      // Remove any potential markdown code blocks
      roadmapContent = roadmapContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Remove any characters before the first '{'
      const startIndex = roadmapContent.indexOf('{');
      if (startIndex > 0) {
        roadmapContent = roadmapContent.substring(startIndex);
      }
      
      // Remove any characters after the last '}'
      const endIndex = roadmapContent.lastIndexOf('}');
      if (endIndex >= 0 && endIndex < roadmapContent.length - 1) {
        roadmapContent = roadmapContent.substring(0, endIndex + 1);
      }

      const roadmap = JSON.parse(roadmapContent);

      // Validate the structure
      const structuredRoadmap = {
        sessionFocus: roadmap.sessionFocus || roadmap["Session Focus"] || "Build rapport and assess current needs",
        primaryGoals: roadmap.primaryGoals || roadmap["Primary Goals"] || [
          "Establish trust and comfort",
          "Understand current challenges",
          "Identify strengths and interests",
          "Set realistic short-term goals"
        ],
        approaches: roadmap.approaches || roadmap["Recommended Approach"] || roadmap.recommendedApproach || [
          "Active listening and empathy",
          "Strength-based counseling",
          "Cultural storytelling integration",
          "Goal-setting and planning"
        ]
      };

      return NextResponse.json({
        success: true,
        roadmap: structuredRoadmap
      });

    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      
      // Fallback roadmap if parsing fails
      const fallbackRoadmap = {
        sessionFocus: `Focus on building trust and understanding ${childProfile.name}'s current situation and needs.`,
        primaryGoals: [
          "Establish a comfortable and safe environment",
          "Listen to current concerns and challenges",
          "Identify personal strengths and interests",
          "Develop initial action steps"
        ],
        approaches: [
          "Use active listening and empathetic communication",
          "Incorporate age-appropriate activities and discussions",
          "Reference relevant cultural stories for guidance",
          "Focus on building self-confidence and resilience"
        ]
      };

      return NextResponse.json({
        success: true,
        roadmap: fallbackRoadmap,
        note: "Using fallback recommendations due to processing error"
      });
    }

  } catch (error) {
    console.error("AI roadmap generation error:", error);
    
    // Return a basic roadmap as fallback
    return NextResponse.json({
      success: true,
      roadmap: {
        sessionFocus: "Focus on understanding the child's current needs and building a supportive relationship.",
        primaryGoals: [
          "Create a safe and welcoming environment",
          "Understand the child's current situation",
          "Identify immediate support needs",
          "Plan next steps together"
        ],
        approaches: [
          "Use warm and empathetic communication",
          "Ask open-ended questions to encourage sharing",
          "Validate the child's feelings and experiences",
          "Provide encouragement and positive reinforcement"
        ]
      },
      note: "Using default recommendations due to system limitations"
    });
  }
}
