import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { startOfWeek, addWeeks, format, subWeeks, isAfter } from 'date-fns';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

export async function GET(request: NextRequest) {
  try {
    // Get user from authorization header
    const { user, error: userError } = await getUserFromAuthHeader(request);
    if (userError || !user) {
      console.error('User error:', userError);
      return NextResponse.json({ error: 'No valid session' }, { status: 401 });
    }

    // Check if user is admin
    if (user.user_metadata?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch all sessions and concerns
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from('sessions')
      .select('id, createdAt');
    const { data: concerns, error: concernsError } = await supabaseAdmin
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
      const sessionsCount = (sessions || []).filter((s: any) => {
        const d = new Date(s.createdAt);
        return isAfter(d, start) && d < end;
      }).length;
      const concernsInWeek = (concerns || []).filter((c: any) => {
        const d = new Date(c.createdAt);
        return isAfter(d, start) && d < end;
      });
      const concernsRecorded = concernsInWeek.length;
      const concernsResolved = concernsInWeek.filter((c: any) => c.status === 'RESOLVED').length;
      return {
        week: label,
        sessions: sessionsCount,
        concernsRecorded,
        concernsResolved
      };
    });
    
    return NextResponse.json({ success: true, data: trendData });
  } catch (error) {
    console.error('Error in GET /api/dashboard/trends:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
