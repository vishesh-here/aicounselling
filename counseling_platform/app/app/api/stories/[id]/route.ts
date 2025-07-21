import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const dynamic = "force-dynamic";

// Helper to get user from authorization header
async function getUserFromAuthHeader(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'No authorization header' };
  }
  
  const accessToken = authHeader.replace('Bearer ', '');
  
  // Create client with anon key
  const client = createClient(supabaseUrl, supabaseAnonKey);
  
  // Get user directly using the access token
  const { data: { user }, error } = await client.auth.getUser(accessToken);
  
  return { user, error };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from authorization header
    const { user, error: userError } = await getUserFromAuthHeader(request);
    if (userError || !user) {
      console.error('User error:', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Create admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch the story from knowledge_base table
    const { data: story, error } = await supabaseAdmin
      .from("knowledge_base")
      .select("*")
      .eq("id", id)
      .eq("isActive", true)
      .single();

    if (error || !story) {
      console.error('Error fetching story:', error);
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    return NextResponse.json(story);

  } catch (error) {
    console.error('Error in GET /api/stories/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
