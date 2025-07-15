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

export async function GET(
  request: NextRequest,
  { params }: { params: { childId: string } }
) {
  try {
    // Extract access token from Authorization header
    const authHeader = request.headers.get('authorization');
    let accessToken = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.replace('Bearer ', '');
    }
    console.log('Access token (history):', accessToken);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    // Authenticate user using the access token
    let user = null;
    if (accessToken) {
      const { data, error } = await supabase.auth.getUser(accessToken);
      if (error || !data?.user) {
        console.log('Supabase user error (history):', error);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      user = data.user;
    } else {
      console.log('No access token provided (history)');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log('Supabase user (history):', user);

    const { childId } = params;
    console.log('API received childId:', childId);

    // Get all conversations for this child with message counts
    const { data: conversations, error: convErr } = await supabase
      .from('ai_chat_conversations')
      .select('*, messages:ai_chat_messages(*), session:sessions(id, startedAt, status)')
      .eq('child_id', childId)
      .eq('isActive', true)
      .order('createdAt', { ascending: false });

    console.log('Conversations found:', conversations?.length);

    if (convErr) {
      console.error('Supabase conversation fetch error:', convErr);
      return NextResponse.json({ success: false, error: 'Failed to fetch conversations' }, { status: 500 });
    }

    // Format the conversations for the frontend
    const formattedConversations = (conversations || []).map(conv => ({
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
      messages: conv.messages.map((msg: any) => ({
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
