// This API route is no longer needed as all map data fetching is now handled client-side using Supabase client SDK.
// You can safely delete this file or leave a comment for future reference.

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Cookie: cookieStore.toString() } },
  });
  return supabase;
}

export async function GET(request: NextRequest) {
  const supabase = getSupabase(request);
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || user.user_metadata.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Get children count by state
  const { data: childrenByState, error: childrenError } = await supabase
    .from('children')
    .select('state, count:id')
    .eq('isActive', true)
    .group('state');
  // Get volunteers count by state
  const { data: volunteersByState, error: volunteersError } = await supabase
    .from('users')
    .select('state, count:id')
    .eq('role', 'VOLUNTEER')
    .eq('isActive', true)
    .not('state', 'is', null)
    .group('state');
  // Get sessions count by state (through children)
  const { data: sessions, error: sessionsError } = await supabase
    .from('sessions')
    .select('id, child_id')
    .eq('isActive', true);
  const { data: children, error: childrenListError } = await supabase
    .from('children')
    .select('id, state')
    .eq('isActive', true);
  // Aggregate sessions by state
  const sessionsByState: Record<string, number> = {};
  if (sessions && children) {
    const childStateMap = Object.fromEntries(children.map((c: any) => [c.id, c.state]));
    sessions.forEach((s: any) => {
      const state = childStateMap[s.child_id];
      if (state) {
        sessionsByState[state] = (sessionsByState[state] || 0) + 1;
      }
    });
  }
  return NextResponse.json({
    childrenByState,
    volunteersByState,
    sessionsByState
  });
}
