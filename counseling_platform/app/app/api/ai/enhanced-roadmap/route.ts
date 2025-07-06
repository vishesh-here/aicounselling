import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/db";
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
    const { child_id, childProfile, activeConcerns } = body;

    // Get recent sessions for context
    const recentSessions = await prisma.session.findMany({
      where: { child_id: child_id },
      include: { summary: true },
      orderBy: { createdAt: "desc" },
      take: 3
    });

    // Get cultural stories for recommendations
    const culturalStories = await prisma.culturalStory.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        summary: true,
        themes: true,
        applicableFor: true,
        moralLessons: true
      }
    });

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

Recent Session History:
${recentSessions?.map((session: any, index: number) => 
  `Session ${index + 1}: ${session.summary?.summary || "No summary"} 
   Status: ${session.summary?.resolutionStatus || "Unknown"}
   Date: ${new Date(session.createdAt).toLocaleDateString()}`
).join("\n") || "No previous sessions"}

This is a child from an underprivileged background in India. Cultural sensitivity and trauma-informed approaches are essential.
`;

    const prompt = `You are an expert child counselor and psychologist specializing in working with underprivileged children in India. You understand trauma-informed care, cultural sensitivity, and age-appropriate counseling techniques.

${context}

Generate a comprehensive session roadmap that provides detailed, actionable guidance for a volunteer counselor. Include:

1. **Pre-Session Preparation**: What the volunteer should know and prepare mentally before starting
2. **Session Objectives**: 3-4 clear, specific, achievable goals for this session
3. **Warning Signs**: 4-5 behavioral/emotional signs to watch for that might indicate distress
4. **Conversation Starters**: 5-7 sample opening questions tailored to this child's situation
5. **Recommended Approach**: Specific counseling techniques best suited for this child
6. **Cultural Context**: How to incorporate relevant cultural elements and show cultural sensitivity
7. **Expected Challenges**: Potential difficulties and practical strategies to handle them
8. **Success Indicators**: How to recognize if the session is going well
9. **Follow-up Actions**: What to do after the session based on different outcomes

Make all recommendations:
- Age-appropriate for a ${childProfile.age}-year-old
- Culturally sensitive to Indian context
- Practical for volunteer counselors
- Trauma-informed and child-centered
- Specific to the child's concerns and background

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
        temperature: 0.8,
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

    // Parse and structure the roadmap
    let roadmap;
    try {
      roadmapContent = roadmapContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      const startIndex = roadmapContent.indexOf('{');
      if (startIndex > 0) {
        roadmapContent = roadmapContent.substring(startIndex);
      }
      const endIndex = roadmapContent.lastIndexOf('}');
      if (endIndex >= 0 && endIndex < roadmapContent.length - 1) {
        roadmapContent = roadmapContent.substring(0, endIndex + 1);
      }

      roadmap = JSON.parse(roadmapContent);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      
      // Enhanced fallback roadmap
      roadmap = {
        preSessionPrep: `Review ${childProfile.name}'s profile and active concerns. Create a calm, safe environment. Be prepared to listen actively and respond with cultural sensitivity.`,
        sessionObjectives: [
          "Establish trust and emotional safety",
          "Understand current challenges and feelings",
          "Identify strengths and coping mechanisms",
          "Develop actionable next steps together"
        ],
        warningSigns: [
          "Sudden silence or withdrawal from conversation",
          "Signs of physical discomfort or anxiety",
          "Mention of harm to self or others",
          "Expressions of hopelessness or despair",
          "Unusual behavioral changes during session"
        ],
        conversationStarters: [
          "How has your week been going?",
          "What's been on your mind lately?",
          "Tell me about something good that happened recently",
          "What's been challenging for you?",
          "How are things at home/school?",
          "What makes you feel happy and confident?",
          "Is there anything you'd like help with today?"
        ],
        recommendedApproach: "Use active listening, validate emotions, employ strength-based counseling, and incorporate cultural storytelling when appropriate.",
        culturalContext: `Acknowledge ${childProfile.name}'s cultural background. Use familiar cultural references and stories. Be respectful of family structures and community values.`,
        expectedChallenges: [
          "Initial reluctance to open up - use patience and gentle encouragement",
          "Language barriers - speak slowly and use simple terms",
          "Trust issues - demonstrate consistency and reliability",
          "Cultural differences - show respect and ask questions to understand better"
        ],
        successIndicators: [
          "Child maintains eye contact and seems comfortable",
          "Child shares personal information voluntarily",
          "Child asks questions or shows curiosity",
          "Child expresses emotions appropriately",
          "Child engages in problem-solving discussions"
        ],
        followUpActions: [
          "Document key insights and progress made",
          "Plan follow-up activities based on session outcomes",
          "Connect with parents/guardians if needed",
          "Prepare resources or referrals if required",
          "Schedule next session with clear objectives"
        ]
      };
    }

    // Recommend relevant stories based on child's profile and concerns
    const recommendedStories = culturalStories
      .filter(story => {
        const childAge = childProfile.age;
        const relevantForAge = story.applicableFor?.some((age: string) => 
          age.toLowerCase().includes(childAge.toString()) || 
          age.toLowerCase().includes("all") ||
          (childAge <= 12 && age.toLowerCase().includes("child")) ||
          (childAge > 12 && age.toLowerCase().includes("teen"))
        );

        const relevantForConcerns = activeConcerns?.some((concern: any) => 
          story.themes?.some((theme: string) => 
            theme.toLowerCase().includes(concern.category.toLowerCase()) ||
            concern.title.toLowerCase().includes(theme.toLowerCase())
          )
        );

        return relevantForAge || relevantForConcerns || story.applicableFor?.includes("Universal");
      })
      .slice(0, 3)
      .map(story => ({
        id: story.id,
        title: story.title,
        summary: story.summary,
        themes: story.themes,
        relevance: `Recommended for ${childProfile.age}-year-old facing ${activeConcerns?.[0]?.category?.toLowerCase()} concerns`
      }));

    return NextResponse.json({
      success: true,
      roadmap,
      recommendedStories
    });

  } catch (error) {
    console.error("Enhanced roadmap generation error:", error);
    
    // Return enhanced fallback roadmap
    return NextResponse.json({
      success: true,
      roadmap: {
        preSessionPrep: "Prepare a welcoming environment and review the child's background. Focus on building trust and rapport.",
        sessionObjectives: [
          "Create a safe and comfortable space",
          "Listen to the child's current concerns",
          "Identify immediate support needs",
          "Plan appropriate next steps"
        ],
        warningSigns: [
          "Signs of distress or anxiety",
          "Reluctance to communicate",
          "Mentions of safety concerns",
          "Sudden behavioral changes"
        ],
        conversationStarters: [
          "How are you feeling today?",
          "Tell me about your day",
          "What's been going well for you?",
          "Is there anything troubling you?",
          "What would you like to talk about?"
        ],
        recommendedApproach: "Use empathetic listening, validate feelings, and focus on the child's strengths and resilience.",
        culturalContext: "Be respectful of the child's cultural background and family values. Use culturally appropriate examples and references.",
        expectedChallenges: [
          "Building initial trust may take time",
          "Communication barriers might exist",
          "Cultural differences may need navigation"
        ],
        successIndicators: [
          "Child appears comfortable and relaxed",
          "Child participates in conversation",
          "Child shows trust in the counselor"
        ],
        followUpActions: [
          "Document session notes thoroughly",
          "Plan appropriate follow-up activities",
          "Consider additional support if needed"
        ]
      },
      recommendedStories: [],
      note: "Using default recommendations due to system limitations"
    });
  }
}
