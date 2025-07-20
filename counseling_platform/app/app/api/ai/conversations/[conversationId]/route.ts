import { NextRequest, NextResponse } from "next/server";
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
    // Extract access token from Authorization header
    const authHeader = request.headers.get('authorization');
    let accessToken = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.replace('Bearer ', '');
    }
    
    // Create simple Supabase client with service role key (like the working history API)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Authenticate user using the access token
    let user = null;
    if (accessToken) {
      const { data, error } = await supabase.auth.getUser(accessToken);
      if (error || !data?.user) {
        console.log('Supabase user error:', error);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      user = data.user;
    } else {
      console.log('No access token provided');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = params;
    console.log('Fetching conversation with ID:', conversationId);

    // Get the conversation with all messages using Supabase
    console.log('Executing Supabase query for conversation ID:', conversationId);
    
    // First, try to get just the conversation without relationships
    const { data: conversation, error: convError } = await supabase
      .from('ai_chat_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      console.error('Error fetching conversation:', convError);
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Then get the messages separately
    const { data: messages, error: msgError } = await supabase
      .from('ai_chat_messages')
      .select('*')
      .eq('conversationId', conversationId)
      .order('timestamp', { ascending: true });

    console.log('Messages fetch result:', { 
      messageCount: messages?.length, 
      error: msgError 
    });

    console.log('Supabase query result:', { 
      conversation: conversation ? 'Found' : 'Not found', 
      error: convError,
      conversationId: conversation?.id,
      messageCount: conversation?.messages?.length
    });

    console.log('Conversation fetch result:', { conversation, error: convError });

    if (convError || !conversation) {
      console.error('Error fetching conversation:', convError);
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const formattedMessages = (messages || []).map((msg: any) => ({
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
    // Extract access token from Authorization header
    const authHeader = request.headers.get('authorization');
    let accessToken = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.replace('Bearer ', '');
    }
    
    // Create simple Supabase client with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Authenticate user using the access token
    let user = null;
    if (accessToken) {
      const { data, error } = await supabase.auth.getUser(accessToken);
      if (error || !data?.user) {
        console.log('Supabase user error:', error);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      user = data.user;
    } else {
      console.log('No access token provided');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = params;

    // Delete the conversation using Supabase (cascade will handle messages)
    const { error: deleteError } = await supabase
      .from('ai_chat_conversations')
      .delete()
      .eq('id', conversationId);

    if (deleteError) {
      console.error('Error deleting conversation:', deleteError);
      return NextResponse.json({
        success: false,
        error: "Failed to delete conversation"
      }, { status: 500 });
    }

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
