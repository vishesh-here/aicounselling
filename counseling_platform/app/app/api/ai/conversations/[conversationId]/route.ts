
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = params;

    // Get the conversation with all messages
    const conversation = await prisma.aiChatConversation.findUnique({
      where: {
        id: conversationId
      },
      include: {
        messages: {
          orderBy: { timestamp: "asc" }
        },
        child: {
          select: {
            id: true,
            name: true,
            age: true
          }
        }
      }
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const formattedMessages = conversation.messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      metadata: msg.metadata
    }));

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        sessionId: conversation.sessionId,
        conversationName: conversation.conversationName,
        createdAt: conversation.createdAt,
        child: conversation.child
      },
      messages: formattedMessages
    });

  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch conversation"
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = params;

    // Delete the conversation (cascade will handle messages)
    await prisma.aiChatConversation.delete({
      where: {
        id: conversationId
      }
    });

    return NextResponse.json({
      success: true,
      message: "Conversation deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to delete conversation"
    }, { status: 500 });
  }
}
