import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

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

// GET - Fetch dashboard data
export async function GET(request: NextRequest) {
  try {
    // Get user from authorization header
    const { user, error: userError } = await getUserFromAuthHeader(request);
    if (userError || !user) {
      console.error('User error:', userError);
      return NextResponse.json({ error: 'No valid session' }, { status: 401 });
    }

    const role = user.user_metadata?.role || user.app_metadata?.role || "VOLUNTEER";
    
    // Create admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch assignments and data based on role
    let assignmentsData: any[] = [];
    let sessionsData: any[] = [];
    
    if (role === "VOLUNTEER") {
      // Fetch assignments for volunteer
      const { data: assign, error: assignError } = await supabaseAdmin
        .from("assignments")
        .select("*, children(*)")
        .eq("volunteerId", user.id)
        .eq("isActive", true);
      if (assignError) throw assignError;
      assignmentsData = assign || [];

      // Fetch recent sessions for volunteer
      const { data: sessions, error: sessionsError } = await supabaseAdmin
        .from("sessions")
        .select("*, child_id:children(fullName, dateOfBirth)")
        .eq("volunteerId", user.id)
        .order("createdAt", { ascending: false })
        .limit(5);
      if (sessionsError) throw sessionsError;
      sessionsData = sessions || [];
    } else if (role === "ADMIN") {
      // Admins can see all assignments and sessions
      const { data: assign, error: assignError } = await supabaseAdmin
        .from("assignments")
        .select("*, children(*)")
        .eq("isActive", true);
      if (assignError) throw assignError;
      assignmentsData = assign || [];

      const { data: sessions, error: sessionsError } = await supabaseAdmin
        .from("sessions")
        .select("*, child_id:children(fullName, dateOfBirth)")
        .order("createdAt", { ascending: false })
        .limit(10);
      if (sessionsError) throw sessionsError;
      sessionsData = sessions || [];
    }

    // Fetch concern analytics data
    const { data: concernData, error: concernError } = await supabaseAdmin
      .from('concerns')
      .select('id, category, child_id');
    if (concernError) throw concernError;

    // Fetch children for age
    const { data: childrenData, error: childrenError } = await supabaseAdmin
      .from('children')
      .select('id, dateOfBirth, isActive')
      .eq('isActive', true);
    if (childrenError) throw childrenError;

    // Group by age group and category
    const analytics: any[] = [];
    (concernData || []).forEach((concern: any) => {
      const child = (childrenData || []).find((c: any) => c.id === concern.child_id);
      if (!child) return;
      
      const birthDate = new Date(child.dateOfBirth);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      
      let age_group = '';
      if (age >= 6 && age <= 10) age_group = '6-10';
      else if (age >= 11 && age <= 13) age_group = '11-13';
      else if (age >= 14 && age <= 16) age_group = '14-16';
      else age_group = '17+';
      
      const existing = analytics.find(a => a.age_group === age_group && a.category === concern.category);
      if (existing) existing.count += 1;
      else analytics.push({ age_group, category: concern.category, count: 1 });
    });

    // Fetch children and volunteers for IndiaMap heatmaps
    const { data: children, error: childrenMapError } = await supabaseAdmin
      .from('children')
      .select('id, state')
      .eq('isActive', true)
      .neq('state', null);
    if (childrenMapError) throw childrenMapError;

    const { data: volunteers, error: volunteersError } = await supabaseAdmin
      .from('users')
      .select('id, state, role')
      .in('role', ['VOLUNTEER', 'ADMIN'])
      .neq('state', null);
    if (volunteersError) throw volunteersError;

    // Aggregate children by state
    const childrenStateMap: Record<string, number> = {};
    (children || []).forEach((c: any) => {
      if (c.state) childrenStateMap[c.state] = (childrenStateMap[c.state] || 0) + 1;
    });

    // Aggregate volunteers by state
    const volunteersStateMap: Record<string, number> = {};
    (volunteers || []).forEach((v: any) => {
      if (v.state) volunteersStateMap[v.state] = (volunteersStateMap[v.state] || 0) + 1;
    });

    return NextResponse.json({
      assignments: assignmentsData,
      recentSessions: sessionsData,
      concernAnalytics: analytics,
      childrenByState: Object.entries(childrenStateMap).map(([state, value]) => ({ state, value })),
      volunteersByState: Object.entries(volunteersStateMap).map(([state, value]) => ({ state, value })),
      userRole: role
    });

  } catch (error) {
    console.error('Error in GET /api/dashboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 