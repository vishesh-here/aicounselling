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

// GET - Fetch all children (with optional filters)
export async function GET(request: NextRequest) {
  try {
    console.log('Children API called');
    
    // Get user from authorization header
    const { user, error: userError } = await getUserFromAuthHeader(request);
    console.log('User from auth header:', user ? 'Found' : 'Not found');
    console.log('User error:', userError);
    
    if (userError || !user) {
      console.error('User error:', userError);
      return NextResponse.json({ error: 'No valid session' }, { status: 401 });
    }

    // Create admin client for database operations with RLS disabled
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
  // TODO: Add filters as needed (search, state, etc.)
  let query = supabaseAdmin
    .from('children')
    .select('*, assignments(*, volunteer:users(id, name, email, specialization)), concerns(*), sessions(*)')
    .eq('isActive', true)
    .order('createdAt', { ascending: false });
  
  // If volunteer, only show assigned children
  if (user.user_metadata?.role === 'VOLUNTEER') {
    // For volunteers, we need to filter children who have assignments with this volunteer
    const { data: assignedChildren, error: assignmentError } = await supabaseAdmin
      .from('assignments')
      .select('child_id')
      .eq('volunteerId', user.id)
      .eq('isActive', true);
    
    if (assignmentError) {
      console.error('Error fetching assignments:', assignmentError);
      return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
    }
    
    const childIds = assignedChildren?.map(assignment => assignment.child_id) || [];
    if (childIds.length > 0) {
      query = query.in('id', childIds);
    } else {
      // If no assignments, return empty array
      return NextResponse.json({ children: [] });
    }
  }
  
  console.log('Executing database query...');
  const { data, error } = await query;
  console.log('Query result - data length:', data?.length || 0);
  console.log('Query error:', error);
  
  if (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // Transform the data to match frontend expectations
  const transformedData = data?.map((child: any) => {
    const activeAssignments = (child.assignments || []).filter((assignment: any) => assignment.isActive);
    console.log(`Child ${child.fullName}: ${child.assignments?.length || 0} total assignments, ${activeAssignments.length} active assignments`);
    return {
      ...child,
      assignments: activeAssignments,
      concernRecords: child.concerns || [] // concerns table exists, use it directly
    };
  }) || [];
  
  return NextResponse.json({ children: transformedData });
  } catch (error) {
    console.error('Error in GET /api/children:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new child (admin only)
export async function POST(request: NextRequest) {
  try {
    // Get user from authorization header
    const { user, error: userError } = await getUserFromAuthHeader(request);
    if (userError || !user) {
      console.error('User error:', userError);
      return NextResponse.json({ error: 'No valid session' }, { status: 401 });
    }
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
  
  // Validate required fields
  const requiredFields = [
    'fullName', 'dateOfBirth', 'gender', 'currentCity', 'state', 
    'educationType', 'currentSchoolCollegeName', 'currentClassSemester', 
    'parentGuardianContactNumber', 'background', 'language'
  ];
  
  const missingFields = requiredFields.filter(field => !body[field]);
  if (missingFields.length > 0) {
    return NextResponse.json({ 
      error: `Missing required fields: ${missingFields.join(', ')}` 
    }, { status: 400 });
  }

  // Validate date of birth
  const birthDate = new Date(body.dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  if (age < 5 || age > 18) {
    return NextResponse.json({ 
      error: 'Child must be between 5 and 18 years old' 
    }, { status: 400 });
  }

  // Prepare child data
  const childData = {
    ...body,
    dateOfBirth: birthDate.toISOString(),
    // Ensure arrays are properly formatted
    interests: Array.isArray(body.interests) ? body.interests : [],
    concerns: Array.isArray(body.concerns) ? body.concerns : [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  console.log('Attempting to insert child data:', JSON.stringify(childData, null, 2));
  
  // Create admin client for database operations
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const { data, error } = await supabaseAdmin.from('children').insert([childData]).select();
  if (error) {
    console.error('Error creating child:', error);
    return NextResponse.json({ 
      error: `Database error: ${error.message}`,
      details: error
    }, { status: 500 });
  }
  
  const child = data[0];
  return NextResponse.json({ child });
  } catch (error) {
    console.error('Error in POST /api/children:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
