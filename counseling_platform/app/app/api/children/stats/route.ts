import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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

// GET - Fetch children statistics
export async function GET(request: NextRequest) {
  try {
    console.log('Children Stats API called');
    
    // Get user from authorization header
    const { user, error: userError } = await getUserFromAuthHeader(request);
    
    if (userError || !user) {
      console.error('User error:', userError);
      return NextResponse.json({ error: 'No valid session' }, { status: 401 });
    }

    // Create admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const userRole = user.user_metadata?.role || user.app_metadata?.role || 'VOLUNTEER';
    
    // For volunteers, get only their assigned children
    let childrenQuery;
    let assignedChildIds: string[] = [];
    
    if (userRole === 'VOLUNTEER') {
      // First get assignment IDs for this volunteer
      const { data: volunteerAssignments, error: assignmentError } = await supabaseAdmin
        .from('assignments')
        .select('child_id')
        .eq('volunteerId', user.id)
        .eq('isActive', true);
      
      if (assignmentError) {
        console.error('Assignment error:', assignmentError);
        return NextResponse.json({ error: 'Failed to get assignments' }, { status: 500 });
      }
      
      assignedChildIds = volunteerAssignments?.map(a => a.child_id) || [];
      
      if (assignedChildIds.length === 0) {
        // Volunteer has no assignments, return empty stats
        return NextResponse.json({
          stats: {
            totalChildren: 0,
            assignedChildren: 0,
            unassignedChildren: 0,
            withConcerns: 0,
            withSessions: 0,
            birthdaysToday: 0,
            birthdayChildren: []
          }
        });
      }
      
      // Filter queries by assigned child IDs
      childrenQuery = supabaseAdmin
        .from('children')
        .select('*')
        .in('id', assignedChildIds)
        .eq('isActive', true);
    } else {
      // Admin sees all children
      childrenQuery = supabaseAdmin
        .from('children')
        .select('*')
        .eq('isActive', true);
    }

    // Get children data
    const { data: childrenData, error: childrenError } = await childrenQuery;
    if (childrenError) throw childrenError;

    const totalChildren = childrenData?.length || 0;

    // Get assignments for these children
    let assignmentsQuery = supabaseAdmin
      .from('assignments')
      .select('child_id, isActive')
      .eq('isActive', true);
    
    if (userRole === 'VOLUNTEER') {
      assignmentsQuery = assignmentsQuery.in('child_id', assignedChildIds);
    }
    
    const { data: assignmentData, error: assignmentError } = await assignmentsQuery;
    if (assignmentError) throw assignmentError;

    // Get concerns for these children
    let concernsQuery = supabaseAdmin
      .from('concerns')
      .select('child_id');
    
    if (userRole === 'VOLUNTEER') {
      concernsQuery = concernsQuery.in('child_id', assignedChildIds);
    }
    
    const { data: concernsData, error: concernsError } = await concernsQuery;
    if (concernsError) throw concernsError;

    // Get sessions for these children
    let sessionsQuery = supabaseAdmin
      .from('sessions')
      .select('child_id');
    
    if (userRole === 'VOLUNTEER') {
      sessionsQuery = sessionsQuery.in('child_id', assignedChildIds);
    }
    
    const { data: sessionsData, error: sessionsError } = await sessionsQuery;
    if (sessionsError) throw sessionsError;

    // Calculate stats
    const assignedChildren = new Set(assignmentData?.map((a: any) => a.child_id) || []);
    const childrenWithConcerns = new Set(concernsData?.map((c: any) => c.child_id) || []);
    const childrenWithSessions = new Set(sessionsData?.map((s: any) => s.child_id) || []);

    // Get birthday notifications
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();
    
    const birthdaysToday = childrenData?.filter((child: any) => {
      if (!child.dateOfBirth) return false;
      const birthDate = new Date(child.dateOfBirth);
      return birthDate.getMonth() === currentMonth && birthDate.getDate() === currentDay;
    }) || [];

    return NextResponse.json({
      stats: {
        totalChildren,
        assignedChildren: userRole === 'VOLUNTEER' ? totalChildren : assignedChildren.size, // For volunteers, all their children are assigned
        unassignedChildren: userRole === 'VOLUNTEER' ? 0 : totalChildren - assignedChildren.size, // For volunteers, no unassigned children
        withConcerns: childrenWithConcerns.size,
        withSessions: childrenWithSessions.size,
        birthdaysToday: birthdaysToday.length,
        birthdayChildren: birthdaysToday
      }
    });

  } catch (error) {
    console.error('Error getting children stats:', error);
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
  }
} 