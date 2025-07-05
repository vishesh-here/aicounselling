
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { child_id, sessionId, conversationId } = await request.json();

    if (!child_id) {
      return NextResponse.json({ error: "Child ID is required" }, { status: 400 });
    }

    // Get comprehensive RAG context
    const ragContext = await buildRAGContext(child_id, sessionId, conversationId);

    return NextResponse.json({ context: ragContext });
  } catch (error) {
    console.error("Error building RAG context:", error);
    return NextResponse.json(
      { error: "Failed to build RAG context" },
      { status: 500 }
    );
  }
}

async function buildRAGContext(child_id: string, sessionId?: string, conversationId?: string) {
  try {
    // 1. Get child profile with all related data
    const child = await prisma.child.findUnique({
      where: { id: child_id },
      include: {
        concerns: {
          where: { status: { not: "RESOLVED" } },
          orderBy: { createdAt: "desc" }
        },
        tags: true,
        assignments: {
          include: {
            volunteer: {
              select: { name: true, specialization: true }
            }
          },
          where: { isActive: true }
        }
      }
    });

    if (!child) {
      throw new Error("Child not found");
    }

    // 2. Get session history (last 5 sessions + current session)
    const sessionHistory = await prisma.session.findMany({
      where: { child_id },
      include: {
        summary: true,
        volunteer: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 6
    });

    // 3. Get current session details if provided
    let currentSession = null;
    if (sessionId) {
      currentSession = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          summary: true,
          volunteer: {
            select: { name: true, specialization: true }
          }
        }
      });
    }

    // 4. Get conversation memories for this child
    const conversationMemories = await prisma.conversationMemory.findMany({
      where: { child_id },
      orderBy: [
        { importance: "desc" },
        { createdAt: "desc" }
      ],
      take: 20
    });

    // 5. Get relevant cultural stories based on child's profile
    const relevantStories = await prisma.culturalStory.findMany({
      where: {
        isActive: true,
        OR: [
          {
            applicableFor: {
              hasSome: [child.gender, `age_${Math.floor(child.age / 5) * 5}`, child.state]
            }
          },
          {
            themes: {
              hasSome: child.interests?.slice(0, 3) || []
            }
          }
        ]
      },
      select: {
        id: true,
        title: true,
        summary: true,
        themes: true,
        moralLessons: true,
        applicableFor: true
      },
      take: 10
    });

    // 6. Get relevant knowledge base content
    const relevantKnowledge = await prisma.knowledgeBase.findMany({
      where: {
        isActive: true,
        OR: [
          {
            category: "PSYCHOLOGICAL_COUNSELING"
          },
          {
            category: "CULTURAL_WISDOM"
          },
          {
            tags: {
              some: {
                name: {
                  in: [...child.interests?.slice(0, 3) || [], ...child.challenges?.slice(0, 2) || []]
                }
              }
            }
          }
        ]
      },
      select: {
        id: true,
        title: true,
        summary: true,
        category: true,
        subCategory: true
      },
      take: 15
    });

    // 7. Get previous AI chat conversations for context
    let previousConversations: any[] = [];
    if (conversationId) {
      const conversation = await prisma.aiChatConversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { timestamp: "asc" },
            take: 20 // Last 20 messages for context
          }
        }
      });
      
      if (conversation) {
        previousConversations = conversation.messages;
      }
    }

    // 8. Build comprehensive context object
    const ragContext = {
      child: {
        id: child.id,
        name: child.name,
        age: child.age,
        gender: child.gender,
        state: child.state,
        district: child.district,
        background: child.background,
        schoolLevel: child.schoolLevel,
        interests: child.interests,
        challenges: child.challenges,
        language: child.language,
        activeConcerns: child.concerns?.map((concern: any) => ({
          category: concern.category,
          title: concern.title,
          description: concern.description,
          severity: concern.severity,
          identifiedAt: concern.identifiedAt
        })) || [],
        tags: child.tags?.map((tag: any) => tag.name) || [],
        assignedVolunteers: child.assignments?.map((assignment: any) => ({
          name: assignment.volunteer.name,
          specialization: assignment.volunteer.specialization
        })) || []
      },
      sessionHistory: sessionHistory?.map((session: any) => ({
        id: session.id,
        status: session.status,
        sessionType: session.sessionType,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        notes: session.notes,
        volunteerName: session.volunteer?.name,
        summary: session.summary ? {
          summary: session.summary.summary,
          concernsDiscussed: session.summary.concernsDiscussed,
          culturalStoriesUsed: session.summary.culturalStoriesUsed,
          progressMade: session.summary.progressMade,
          nextSteps: session.summary.nextSteps,
          resolutionStatus: session.summary.resolutionStatus
        } : null
      })) || [],
      currentSession: currentSession ? {
        id: currentSession.id,
        status: currentSession.status,
        sessionType: currentSession.sessionType,
        startedAt: currentSession.startedAt,
        volunteerName: currentSession.volunteer?.name,
        volunteerSpecialization: currentSession.volunteer?.specialization,
        notes: currentSession.notes
      } : null,
      conversationMemories: conversationMemories?.map((memory: any) => ({
        type: memory.memoryType,
        content: memory.content,
        importance: memory.importance,
        associatedTags: memory.associatedTags,
        createdAt: memory.createdAt
      })) || [],
      relevantStories: relevantStories?.map((story: any) => ({
        id: story.id,
        title: story.title,
        summary: story.summary,
        themes: story.themes,
        moralLessons: story.moralLessons,
        applicableFor: story.applicableFor
      })) || [],
      relevantKnowledge: relevantKnowledge?.map((knowledge: any) => ({
        id: knowledge.id,
        title: knowledge.title,
        summary: knowledge.summary,
        category: knowledge.category,
        subCategory: knowledge.subCategory
      })) || [],
      previousConversations: previousConversations?.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      })) || [],
      contextMetadata: {
        buildTimestamp: new Date().toISOString(),
        totalConcerns: child.concerns?.length || 0,
        totalSessions: sessionHistory?.length || 0,
        totalMemories: conversationMemories?.length || 0,
        culturalContext: {
          state: child.state,
          language: child.language,
          relevantStoriesCount: relevantStories?.length || 0
        }
      }
    };

    return ragContext;
  } catch (error) {
    console.error("Error in buildRAGContext:", error);
    throw error;
  }
}
