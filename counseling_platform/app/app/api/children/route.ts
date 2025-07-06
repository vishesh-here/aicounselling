import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Helper to get Supabase client with user session or access token
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

// GET - Fetch all children (with optional filters)
export async function GET(request: NextRequest) {
  const supabase = getSupabaseWithAuth(request);
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // TODO: Add filters as needed (search, state, etc.)
  let query = supabase
    .from('children')
    .select('*, assignments(*, volunteer:users(id, name, specialization)), concerns(*), sessions(*)')
    .eq('isActive', true)
    .order('createdAt', { ascending: false });
  // If volunteer, only show assigned children
  if (user.user_metadata.role === 'VOLUNTEER') {
    query = query.contains('assignments', [{ volunteerId: user.id, isActive: true }]);
  }
  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ children: data });
}

// POST - Create a new child (admin only)
export async function POST(request: NextRequest) {
  const supabase = getSupabaseWithAuth(request);
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log('User roles 0:', {
    user_metadata: user?.user_metadata?.role,
    app_metadata: user?.app_metadata?.role,
    // raw_user_meta_data: rawUserMeta?.role,
    // raw_app_meta_data: rawAppMeta?.role,
    // final: userRole
  });
  // Robust role check and logging
  // @ts-expect-error: raw_user_meta_data may exist at runtime
  const rawUserMeta = user?.['raw_user_meta_data'];
  // @ts-expect-error: raw_app_meta_data may exist at runtime
  const rawAppMeta = user?.['raw_app_meta_data'];
  const userRole = user?.user_metadata?.role || user?.app_metadata?.role || rawUserMeta?.role || rawAppMeta?.role;
  console.log('User roles:', {
    user_metadata: user?.user_metadata?.role,
    app_metadata: user?.app_metadata?.role,
    raw_user_meta_data: rawUserMeta?.role,
    raw_app_meta_data: rawAppMeta?.role,
    final: userRole
  });
  if (!user || userRole !== 'ADMIN') {
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
