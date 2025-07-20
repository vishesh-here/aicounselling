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

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { action, child_id, volunteerId, assignment_id } = body;
    
    if (action === 'assign') {
      // Check if assignment already exists (active or inactive)
      const { data: existing, error: existError } = await supabaseAdmin
        .from('assignments')
        .select('*')
        .eq('child_id', child_id)
        .eq('volunteerId', volunteerId)
        .maybeSingle();
      
      if (existError && existError.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error checking existing assignment:', existError);
        return NextResponse.json({ error: 'Failed to check existing assignment' }, { status: 500 });
      }
      
      if (existing) {
        if (existing.isActive) {
          return NextResponse.json({ error: 'Assignment already exists for this volunteer and child' }, { status: 400 });
        } else {
          // Reactivate the existing inactive assignment
          console.log('Reactivating existing inactive assignment:', existing.id);
          const { data, error } = await supabaseAdmin
            .from('assignments')
            .update({ isActive: true, assignedAt: new Date().toISOString() })
            .eq('id', existing.id)
            .select();
          if (error) {
            console.error('Error reactivating assignment:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
          }
          return NextResponse.json({ success: true, message: 'Assignment reactivated successfully', assignment: data[0] });
        }
      }
      
      // Create new assignment
      const assignmentId = `cmdb${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      const assignmentData = { id: assignmentId, child_id, volunteerId, isActive: true };
      console.log('Creating new assignment data:', assignmentData);
      
      const { data, error } = await supabaseAdmin
        .from('assignments')
        .insert([assignmentData])
        .select();
      if (error) {
        console.error('Error creating assignment:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: 'Assignment created successfully', assignment: data[0] });
    }
    
    if (action === 'remove' && assignment_id) {
      console.log('Removing assignment with ID:', assignment_id);
      
      // First, check the current state of the assignment
      const { data: currentAssignment, error: checkError } = await supabaseAdmin
        .from('assignments')
        .select('*')
        .eq('id', assignment_id)
        .single();
      
      if (checkError) {
        console.error('Error checking assignment:', checkError);
        return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
      }
      
      console.log('Current assignment state:', currentAssignment);
      
      if (!currentAssignment.isActive) {
        return NextResponse.json({ error: 'Assignment is already inactive' }, { status: 400 });
      }
      
      const { data, error } = await supabaseAdmin
        .from('assignments')
        .update({ isActive: false })
        .eq('id', assignment_id)
        .select();
      if (error) {
        console.error('Error removing assignment:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      console.log('Assignment removed successfully:', data[0]);
      return NextResponse.json({ success: true, message: 'Assignment removed successfully', assignment: data[0] });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in POST /api/admin/assignments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Fetch assignments
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
    
    // Fetch assignments with child and volunteer data
    const { data: assignmentsData, error: assignmentsError } = await supabaseAdmin
      .from('assignments')
      .select('*, child:children(*), volunteer:users(id, name, email, specialization)')
      .eq('isActive', true);
    if (assignmentsError) throw assignmentsError;

    console.log('Fetched assignments:', assignmentsData);
    return NextResponse.json({ assignments: assignmentsData || [] });
  } catch (error) {
    console.error('Error in GET /api/admin/assignments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
