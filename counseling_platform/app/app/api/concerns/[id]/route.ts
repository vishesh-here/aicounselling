import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { staticContextCache } from "../../ai/rag-context/route";

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
  // Use service role key directly for database operations
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

function getSupabaseForUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    // Create client with user's access token for authentication
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });
  } else {
    // Fallback to cookie-based auth
    const cookieStore = cookies();
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: {
        headers: {
          Cookie: cookieStore.toString()
        }
      }
    });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user authentication first
    const userSupabase = getSupabaseForUser(request);
    let user = null;
    try {
      const { data: { user: sessionUser }, error: userError } = await userSupabase.auth.getUser();
      user = sessionUser;
      if (!user) {
        console.log('No user session found, userError:', userError);
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
    } catch (error) {
      console.log('Error getting user session:', error);
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Use service role for database operations
    const supabase = getSupabaseWithAuth(request);
    
    const concernId = params.id;
    if (!concernId) {
      return NextResponse.json({ error: "Missing concern id" }, { status: 400 });
    }
    
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("concerns")
      .update({ 
        status: "RESOLVED", 
        resolvedAt: now,
        updatedAt: now
      })
      .eq("id", concernId)
      .select()
      .single();
      
    if (error) {
      console.error('Database error in concerns PATCH:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Invalidate static RAG context cache for this child
    if (data && data.child_id) {
      staticContextCache.delete(data.child_id);
    }
    
    return NextResponse.json({ concern: data });
  } catch (err: any) {
    console.error('Error in concerns PATCH:', err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
} 