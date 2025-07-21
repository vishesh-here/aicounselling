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

// GET - Fetch children with pagination and optimized queries
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const state = searchParams.get('state') || '';
    const gender = searchParams.get('gender') || '';
    const ageFilter = searchParams.get('ageFilter') || '';
    const showAssignedOnly = searchParams.get('showAssignedOnly') === 'true';
    const statsOnly = searchParams.get('statsOnly') === 'true';

    // Validate pagination parameters
    const validLimit = Math.min(Math.max(limit, 1), 100); // Max 100 per page
    const validPage = Math.max(page, 1);
    const offset = (validPage - 1) * validLimit;

    // Create admin client for database operations with RLS disabled
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // If stats only, return optimized stats query
    if (statsOnly) {
      return await getChildrenStats(supabaseAdmin, user);
    }

    // Build base query with minimal data for list view
    let query = supabaseAdmin
      .from('children')
      .select(`
        id,
        fullName,
        dateOfBirth,
        gender,
        currentCity,
        state,
        educationType,
        currentSchoolCollegeName,
        currentClassSemester,
        whatsappNumber,
        callingNumber,
        parentGuardianContactNumber,
        background,
        language,
        createdAt,
        updatedAt,
        assignments(id, isActive, volunteer:users(id, name, email, specialization))
      `);

    // Apply filters
    if (search) {
      query = query.ilike('fullName', `%${search}%`);
    }
    if (state) {
      query = query.eq('state', state);
    }
    if (gender) {
      query = query.eq('gender', gender);
    }
    if (ageFilter) {
      const [min, max] = ageFilter.split('-');
      const currentYear = new Date().getFullYear();
      if (min) {
        const maxBirthYear = currentYear - parseInt(min);
        query = query.lte('dateOfBirth', `${maxBirthYear}-12-31`);
      }
      if (max) {
        const minBirthYear = currentYear - parseInt(max);
        query = query.gte('dateOfBirth', `${minBirthYear}-01-01`);
      }
    }

    // If show assigned only, filter for children with active assignments
    if (showAssignedOnly) {
      query = query.eq('assignments.isActive', true);
    }

    // Get total count for pagination - build count query with same filters as main query
    let countQuery = supabaseAdmin
      .from('children')
      .select('*', { count: 'exact', head: true });

    // Apply same filters to count query
    if (search) {
      countQuery = countQuery.ilike('fullName', `%${search}%`);
    }
    if (state) {
      countQuery = countQuery.eq('state', state);
    }
    if (gender) {
      countQuery = countQuery.eq('gender', gender);
    }
    if (ageFilter) {
      const [min, max] = ageFilter.split('-');
      const currentYear = new Date().getFullYear();
      if (min) {
        const maxBirthYear = currentYear - parseInt(min);
        countQuery = countQuery.lte('dateOfBirth', `${maxBirthYear}-12-31`);
      }
      if (max) {
        const minBirthYear = currentYear - parseInt(max);
        countQuery = countQuery.gte('dateOfBirth', `${minBirthYear}-01-01`);
      }
    }

    // If show assigned only, count only children with active assignments
    if (showAssignedOnly) {
      countQuery = countQuery.eq('assignments.isActive', true);
    }

    // If volunteer, only show assigned children - use proper filtering
    const userRole = user.user_metadata?.role || user.app_metadata?.role || 'VOLUNTEER';
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
      
      const assignedChildIds = volunteerAssignments?.map(a => a.child_id) || [];
      
      if (assignedChildIds.length === 0) {
        // Volunteer has no assignments, return empty result
        return NextResponse.json({
          children: [],
          pagination: {
            page: 1,
            limit: validLimit,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        });
      }
      
      // Filter both main query and count query by assigned child IDs
      query = query.in('id', assignedChildIds);
      countQuery = countQuery.in('id', assignedChildIds);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Count error:', countError);
      return NextResponse.json({ error: 'Failed to get count' }, { status: 500 });
    }

    // Apply pagination and ordering
    query = query
      .order('createdAt', { ascending: false })
      .range(offset, offset + validLimit - 1);

    console.log('Executing optimized database query...');
    console.log('Query filters:', { search, state, gender, ageFilter, showAssignedOnly });
    const { data, error } = await query;
    console.log('Query result - data length:', data?.length || 0);
    console.log('Query error:', error);
    console.log('Count result:', count);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform the data to match frontend expectations
    const transformedData = data?.map((child: any) => {
      const activeAssignments = (child.assignments || []).filter((assignment: any) => assignment.isActive);
      return {
        ...child,
        assignments: activeAssignments,
        // Calculate age for display
        age: child.dateOfBirth ? 
          Math.floor((Date.now() - new Date(child.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 
          null
      };
    }) || [];

    return NextResponse.json({
      children: transformedData,
      pagination: {
        page: validPage,
        limit: validLimit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / validLimit),
        hasNext: validPage < Math.ceil((count || 0) / validLimit),
        hasPrev: validPage > 1
      }
    });

  } catch (error) {
    console.error('Error in GET /api/children:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Separate function for optimized stats
async function getChildrenStats(supabaseAdmin: any, user: any) {
  try {
    // Get total children count
    const { count: totalChildren, error: totalError } = await supabaseAdmin
      .from('children')
      .select('*', { count: 'exact', head: true })
      .eq('isActive', true);

    if (totalError) throw totalError;

    // Get children by state
    const { data: stateData, error: stateError } = await supabaseAdmin
      .from('children')
      .select('state')
      .eq('isActive', true)
      .not('state', 'is', null);

    if (stateError) throw stateError;

    // Get children by gender
    const { data: genderData, error: genderError } = await supabaseAdmin
      .from('children')
      .select('gender')
      .eq('isActive', true);

    if (genderError) throw genderError;

    // Get children by age groups
    const { data: ageData, error: ageError } = await supabaseAdmin
      .from('children')
      .select('dateOfBirth')
      .eq('isActive', true);

    if (ageError) throw ageError;

    // Calculate age groups
    const currentYear = new Date().getFullYear();
    const ageGroups = {
      '5-10': 0,
      '11-15': 0,
      '16-20': 0
    };

    ageData?.forEach((child: any) => {
      if (child.dateOfBirth) {
        const birthYear = new Date(child.dateOfBirth).getFullYear();
        const age = currentYear - birthYear;
        if (age >= 5 && age <= 10) ageGroups['5-10']++;
        else if (age >= 11 && age <= 15) ageGroups['11-15']++;
        else if (age >= 16 && age <= 20) ageGroups['16-20']++;
      }
    });

    // Aggregate state data
    const stateCounts: Record<string, number> = {};
    stateData?.forEach((child: any) => {
      if (child.state) {
        stateCounts[child.state] = (stateCounts[child.state] || 0) + 1;
      }
    });

    // Aggregate gender data
    const genderCounts: Record<string, number> = {};
    genderData?.forEach((child: any) => {
      if (child.gender) {
        genderCounts[child.gender] = (genderCounts[child.gender] || 0) + 1;
      }
    });

    return NextResponse.json({
      stats: {
        totalChildren: totalChildren || 0,
        byState: stateCounts,
        byGender: genderCounts,
        byAgeGroup: ageGroups
      }
    });

  } catch (error) {
    console.error('Error getting children stats:', error);
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
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
  if (age < 5 || age > 20) {
    return NextResponse.json({ 
      error: 'Child must be between 5 and 20 years old' 
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
