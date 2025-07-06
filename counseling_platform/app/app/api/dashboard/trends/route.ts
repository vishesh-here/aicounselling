// This API route is no longer needed as all trends data fetching is now handled client-side using Supabase client SDK.
// You can safely delete this file or leave a comment for future reference.

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { startOfWeek, addWeeks, format, subWeeks, isAfter } from 'date-fns';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabaseWithAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const accessToken = authHeader?.split(' ')[1];
  return createClient(supabaseUrl, supabaseServiceKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false },
  });
}

export async function GET(request: NextRequest) {
  const supabase = getSupabaseWithAuth(request);
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || user.user_metadata.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Fetch all sessions and concerns
  const { data: sessions, error: sessionsError } = await supabase
    .from('sessions')
    .select('id, createdAt');
  const { data: concerns, error: concernsError } = await supabase
    .from('concerns')
    .select('id, createdAt, status');
  if (sessionsError || concernsError) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
  // Get last 12 weeks
  const now = new Date();
  const weeks = [];
  let weekStart = startOfWeek(subWeeks(now, 11), { weekStartsOn: 1 });
  for (let i = 0; i < 12; i++) {
    const weekEnd = addWeeks(weekStart, 1);
    weeks.push({
      label: format(weekStart, 'MMM d'),
      start: new Date(weekStart),
      end: new Date(weekEnd)
    });
    weekStart = weekEnd;
  }
  // Aggregate data
  const trendData = weeks.map(({ label, start, end }) => {
    const sessionsCount = (sessions || []).filter(s => {
      const d = new Date(s.createdAt);
      return isAfter(d, start) && d < end;
    }).length;
    const concernsInWeek = (concerns || []).filter(c => {
      const d = new Date(c.createdAt);
      return isAfter(d, start) && d < end;
    });
    const concernsRecorded = concernsInWeek.length;
    const concernsResolved = concernsInWeek.filter(c => c.status === 'RESOLVED').length;
    return {
      week: label,
      sessions: sessionsCount,
      concernsRecorded,
      concernsResolved
    };
  });
  return NextResponse.json({ success: true, data: trendData });
}
