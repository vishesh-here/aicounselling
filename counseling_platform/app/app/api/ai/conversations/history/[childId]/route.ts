
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { child_id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { child_id } = params;

    // Get all conversations for this child with message counts
    const conversations = await prisma.aiChatConversation.findMany({
      where: {
        child_id: child_id,
        isActive: true
      },
      include: {
        messages: {
          orderBy: { timestamp: "asc" }
        },
        session: {
          select: {
            id: true,
            startedAt: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Format the conversations for the frontend
    const formattedConversations = conversations.map(conv => ({
      id: conv.id,
      sessionId: conv.sessionId,
      conversationName: conv.conversationName || `Conversation ${conv.id.slice(-6)}`,
      createdAt: conv.createdAt,
      isActive: conv.isActive,
      messageCount: conv.messages.length,
      lastMessageAt: conv.messages.length > 0 
        ? conv.messages[conv.messages.length - 1].timestamp 
        : conv.createdAt,
      sessionInfo: conv.session ? {
        id: conv.session.id,
        startedAt: conv.session.startedAt,
        status: conv.session.status
      } : null,
      messages: conv.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        metadata: msg.metadata
      }))
    }));

    return NextResponse.json({
      success: true,
      conversations: formattedConversations
    });

  } catch (error) {
    console.error("Error fetching conversation history:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch conversation history"
    }, { status: 500 });
  }
}
