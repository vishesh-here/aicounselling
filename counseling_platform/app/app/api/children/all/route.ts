import { createClient } from '@supabase/supabase-js';
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

// GET - Fetch all children for admin tools (no pagination)
export async function GET(request: NextRequest) {
  try {
    console.log('Children All API called');
    
    // Get user from authorization header
    const { user, error: userError } = await getUserFromAuthHeader(request);
    
    if (userError || !user) {
      console.error('User error:', userError);
      return NextResponse.json({ error: 'No valid session' }, { status: 401 });
    }

    // Check if user is admin
    const userRole = user.user_metadata?.role || user.app_metadata?.role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    // Create admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Fetch all children with minimal data for admin tools
    const { data, error } = await supabaseAdmin
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
      `)
      .eq('isActive', true)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform the data
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

    return NextResponse.json({ children: transformedData });

  } catch (error) {
    console.error('Error in GET /api/children/all:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 