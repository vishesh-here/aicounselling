import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
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

// GET - Fetch volunteers
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
    
    // Fetch all users, then filter for volunteers and admins
    const { data: allUsers, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, name, email, specialization, state, role, isActive');
    if (usersError) throw usersError;
    
    const volunteers = (allUsers || []).filter(u => {
      const role = u.role;
      return (role === 'VOLUNTEER' || role === 'ADMIN') && u.isActive;
    });

    return NextResponse.json({ volunteers });
  } catch (error) {
    console.error('Error in GET /api/admin/volunteers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 