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

// GET - Fetch dashboard stats
export async function GET(request: NextRequest) {
  try {
    // Get user from authorization header
    const { user, error: userError } = await getUserFromAuthHeader(request);
    if (userError || !user) {
      console.error('User error:', userError);
      return NextResponse.json({ error: 'No valid session' }, { status: 401 });
    }

    const role = user.user_metadata?.role || user.app_metadata?.role;
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }
    
    // Create admin client for database operations with RLS disabled
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Fetch children
    const { data: childrenData, error: childrenError } = await supabaseAdmin
      .from('children')
      .select('*, assignments(*), concerns(*), sessions(*)')
      .eq('isActive', true);
    if (childrenError) throw childrenError;
    
    // Fetch volunteers
    const { data: allUsers, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, name, email, role, state, isActive, approvalStatus');
    if (usersError) throw usersError;
    
    const volunteers = (allUsers || []).filter(u => {
      // Include both VOLUNTEER and ADMIN roles since admins can also conduct sessions
      return (u.role === 'VOLUNTEER' || u.role === 'ADMIN') && u.approvalStatus === 'APPROVED' && u.isActive;
    });
    
    // Fetch sessions
    const { data: sessionsData, error: sessionsError } = await supabaseAdmin
      .from('sessions')
      .select('*');
    if (sessionsError) throw sessionsError;
    
    // Aggregate stats
    const stats = {
      totalChildren: childrenData?.length || 0,
      assignedChildren: childrenData?.filter(child => child.assignments && child.assignments.length > 0).length || 0,
      unassignedChildren: childrenData?.filter(child => !child.assignments || child.assignments.length === 0).length || 0,
      totalVolunteers: volunteers.length,
      activeAssignments: childrenData?.reduce((acc, child) => acc + (child.assignments ? child.assignments.length : 0), 0) || 0,
      totalSessions: sessionsData?.length || 0,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error in GET /api/dashboard/stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 