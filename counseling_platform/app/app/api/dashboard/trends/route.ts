// This API route is no longer needed as all trends data fetching is now handled client-side using Supabase client SDK.
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
  // Example: Fetch sessions per month for the last 6 months
  const { data: sessions, error: sessionsError } = await supabase
    .from('sessions')
    .select('id, created_at')
    .eq('is_active', true);
  // Aggregate sessions by month
  const trends: Record<string, number> = {};
  if (sessions) {
    sessions.forEach((s: any) => {
      const month = s.created_at.slice(0, 7); // YYYY-MM
      trends[month] = (trends[month] || 0) + 1;
    });
  }
  return NextResponse.json({ trends });
}
