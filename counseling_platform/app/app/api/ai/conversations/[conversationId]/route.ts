import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/db";
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabaseWithAuth(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  let globalHeaders: Record<string, string> = {};
  if (authHeader) {
    globalHeaders['Authorization'] = authHeader;
  } else {
    const cookieStore = cookies();
    globalHeaders['Cookie'] = cookieStore.toString();
  }
  return createClient(supabaseUrl, supabaseKey, { global: { headers: globalHeaders } });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const supabase = getSupabaseWithAuth(request);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user) {
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
    const supabase = getSupabaseWithAuth(request);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user) {
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
