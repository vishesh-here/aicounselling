import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Helper to get Supabase client with user session
function getSupabase(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Cookie: cookieStore.toString() } },
  });
  return supabase;
}

// GET - Fetch all children (with optional filters)
export async function GET(request: NextRequest) {
  const supabase = getSupabase(request);
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // TODO: Add filters as needed (search, state, etc.)
  let query = supabase
    .from('children')
    .select('*, assignments(*, volunteer:users(id, name, specialization)), concerns(*), sessions(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  // If volunteer, only show assigned children
  if (user.user_metadata.role === 'VOLUNTEER') {
    query = query.contains('assignments', [{ volunteer_id: user.id, is_active: true }]);
  }
  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ children: data });
}

// POST - Create a new child (admin only)
export async function POST(request: NextRequest) {
  const supabase = getSupabase(request);
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || user.user_metadata.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Only administrators can create child profiles.' }, { status: 401 });
  }
  const body = await request.json();
  // TODO: Validate body fields
  const { data, error } = await supabase.from('children').insert([{ ...body }]).select();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ child: data[0] });
}
