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
    const { sessionId, summaryData, isDraft = false } = body;

    // Validate required fields
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Check if session exists and belongs to the user
    const sessionRecord = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { volunteer: true }
    });

    if (!sessionRecord) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (sessionRecord.volunteerId !== user.id) {
      return NextResponse.json({ error: "Unauthorized access to session" }, { status: 403 });
    }

    // Prepare the summary data for database
    const summaryPayload = {
      summary: summaryData.additionalNotes || "Session completed",
      sessionDuration: summaryData.sessionDuration,
      sessionType: summaryData.sessionType,
      
      // Mood and state
      initialMood: summaryData.initialMood,
      finalMood: summaryData.finalMood,
      moodChanges: summaryData.moodChanges,
      
      // Content and topics
      concernsDiscussed: summaryData.concernsAddressed || [],
      topicsDiscussed: summaryData.topicsDiscussed || [],
      
      // Techniques and cultural elements
      culturalStoriesUsed: summaryData.culturalStoriesUsed || [],
      techniquesUsed: summaryData.techniquesUsed || [],
      techniqueEffectiveness: summaryData.techniqueEffectiveness || {},
      storyResponse: summaryData.storyResponse,
      
      // Insights and breakthroughs
      breakthroughs: summaryData.breakthroughs,
      keyInsights: summaryData.keyInsights,
      
      // Challenges and engagement
      challengesFaced: summaryData.challengesFaced,
      challengeHandling: summaryData.challengeHandling,
      engagementLevel: summaryData.engagementLevel,
      participationNotes: summaryData.participationNotes,
      
      // Progress and next steps
      progressMade: summaryData.breakthroughs || summaryData.keyInsights,
      nextSteps: summaryData.actionItems || [],
      actionItems: summaryData.actionItems || [],
      recommendations: summaryData.recommendations,
      
      // Assessment and planning
      sessionEffectiveness: summaryData.sessionEffectiveness,
      volunteerConfidence: summaryData.volunteerConfidence,
      nextSessionFocus: summaryData.nextSessionFocus,
      nextSessionTiming: summaryData.nextSessionTiming,
      
      // Additional information
      additionalNotes: summaryData.additionalNotes,
      
      // Set resolution status based on effectiveness and next steps
      resolutionStatus: (summaryData.sessionEffectiveness === "Very Effective" && summaryData.actionItems?.length === 0) 
        ? ("RESOLVED" as const)
        : ("IN_PROGRESS" as const),
      followUpNeeded: summaryData.actionItems?.length > 0 || summaryData.nextSessionFocus,
      followUpDate: summaryData.nextSessionTiming ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null // Default to 1 week if timing specified
    };

    // Create or update session summary
    const existingSummary = await prisma.sessionSummary.findUnique({
      where: { sessionId }
    });

    let savedSummary;
    if (existingSummary) {
      savedSummary = await prisma.sessionSummary.update({
        where: { sessionId },
        data: summaryPayload
      });
    } else {
      savedSummary = await prisma.sessionSummary.create({
        data: {
          sessionId,
          ...summaryPayload
        }
      });
    }

    // If not a draft, also update the session status
    if (!isDraft) {
      await prisma.session.update({
        where: { id: sessionId },
        data: {
          status: "COMPLETED",
          endedAt: new Date()
        }
      });

      // Create conversation memory entries for important insights
      if (summaryData.keyInsights || summaryData.breakthroughs) {
        const memoryEntries = [];
        
        if (summaryData.keyInsights) {
          memoryEntries.push({
            child_id: sessionRecord.child_id,
            volunteerId: user.id,
            sessionId: sessionId,
            memoryType: "IMPORTANT_INSIGHT" as const,
            content: summaryData.keyInsights,
            importance: 4,
            associatedTags: summaryData.topicsDiscussed || []
          });
        }

        if (summaryData.breakthroughs) {
          memoryEntries.push({
            child_id: sessionRecord.child_id,
            volunteerId: user.id,
            sessionId: sessionId,
            memoryType: "BREAKTHROUGH_MOMENT" as const,
            content: summaryData.breakthroughs,
            importance: 5,
            associatedTags: summaryData.topicsDiscussed || []
          });
        }

        if (summaryData.challengesFaced) {
          memoryEntries.push({
            child_id: sessionRecord.child_id,
            volunteerId: user.id,
            sessionId: sessionId,
            memoryType: "WARNING_SIGN" as const,
            content: summaryData.challengesFaced,
            importance: 3,
            associatedTags: ["challenges"]
          });
        }

        // Save memory entries
        for (const entry of memoryEntries) {
          await prisma.conversationMemory.create({ data: entry });
        }
      }
    }

    return NextResponse.json({
      success: true,
      summary: savedSummary,
      message: isDraft ? "Summary saved as draft" : "Session summary submitted successfully"
    });

  } catch (error) {
    console.error("Error saving session summary:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to save session summary"
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseWithAuth(request);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Get session summary
    const summary = await prisma.sessionSummary.findUnique({
      where: { sessionId },
      include: {
        session: {
          include: {
            child: true,
            volunteer: true
          }
        }
      }
    });

    if (!summary) {
      return NextResponse.json({ error: "Summary not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      summary
    });

  } catch (error) {
    console.error("Error fetching session summary:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch session summary"
    }, { status: 500 });
  }
}
