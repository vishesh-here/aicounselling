import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { staticContextCache } from "../../ai/rag-context/route";

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

// GET - Fetch a specific child by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Extract access token from Authorization header
  const authHeader = request.headers.get('authorization');
  let accessToken = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    accessToken = authHeader.replace('Bearer ', '');
  }

  // Create admin client for database operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Authenticate user using the access token
  let user = null;
  if (accessToken) {
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error || !data?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    user = data.user;
  } else {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch the child profile with all related data
  const { id } = params;
  const { data: child, error: childError } = await supabase
    .from('children')
    .select('*, assignments(*, volunteer:users(id, name, specialization)), concerns(*), sessions(*, volunteer:users(id, name))')
    .eq('id', id)
    .eq('isActive', true)
    .single();

  if (childError || !child) {
    return NextResponse.json({ error: 'Child not found' }, { status: 404 });
  }



  // Check if user has access to this child
  const userRole = user.user_metadata?.role || user.app_metadata?.role;
  console.log('User access check:', { userId: user.id, userEmail: user.email, userRole, childId: id });
  
  if (userRole === 'VOLUNTEER') {
    const assigned = (child.assignments || []).some((a: any) => a.volunteerId === user.id && a.isActive);
    console.log('Volunteer assignment check:', { assignments: child.assignments, assigned });
    if (!assigned) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  } else if (userRole === 'ADMIN') {
    console.log('Admin access granted');
  } else {
    console.log('Unknown role:', userRole);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  return NextResponse.json({ child }, { status: 200 });
}

// PUT - Update a child profile
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from authorization header
    const { user, error: userError } = await getUserFromAuthHeader(request);
    if (userError || !user) {
      console.error('User error:', userError);
      return NextResponse.json({ error: 'No valid session' }, { status: 401 });
    }

    // Check if user is admin
    const userRole = user.user_metadata?.role || user.app_metadata?.role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Only administrators can update child profiles.' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const {
      fullName,
      mothersName,
      fathersName,
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
      interests,
      concerns,
      language
    } = body;

    // Validation
    const errors: { [key: string]: string } = {};

    if (!fullName?.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 5 || age > 18) {
        errors.dateOfBirth = 'Child must be between 5 and 18 years old';
      }
    }

    if (!gender || !['MALE', 'FEMALE', 'OTHER'].includes(gender)) {
      errors.gender = 'Please select a valid gender';
    }

    if (!currentCity?.trim()) {
      errors.currentCity = 'Current city is required';
    }

    if (!state?.trim()) {
      errors.state = 'State is required';
    }

    if (!educationType?.trim()) {
      errors.educationType = 'Education type is required';
    }

    if (!currentSchoolCollegeName?.trim()) {
      errors.currentSchoolCollegeName = 'School/College name is required';
    }

    if (!currentClassSemester?.trim()) {
      errors.currentClassSemester = 'Current class/semester is required';
    }

    if (!parentGuardianContactNumber?.trim()) {
      errors.parentGuardianContactNumber = 'Parent/Guardian contact number is required';
    }

    if (!background?.trim()) {
      errors.background = 'Background information is required';
    }

    if (!language?.trim()) {
      errors.language = 'Preferred language is required';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Create admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check if child exists
    const { data: existingChild, error: existingError } = await supabaseAdmin
      .from('children')
      .select('*')
      .eq('id', id)
      .eq('isActive', true)
      .single();

    if (existingError || !existingChild) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // Check if another child with same name, date of birth, and current city already exists (excluding current child)
    const { data: duplicateChild, error: duplicateError } = await supabaseAdmin
      .from('children')
      .select('*')
      .eq('fullName', fullName.trim())
      .eq('dateOfBirth', dateOfBirth)
      .eq('currentCity', currentCity.trim())
      .eq('isActive', true)
      .neq('id', id)
      .single();

    if (duplicateChild) {
      return NextResponse.json(
        { errors: { fullName: 'A child with the same name, date of birth, and city already exists' } },
        { status: 400 }
      );
    }

    // Update the child profile
    const { data: updatedChild, error: updateError } = await supabaseAdmin
      .from('children')
      .update({
        fullName: fullName.trim(),
        mothersName: mothersName?.trim() || null,
        fathersName: fathersName?.trim() || null,
        dateOfBirth: new Date(dateOfBirth).toISOString(),
        gender: gender,
        currentCity: currentCity.trim(),
        state: state.trim(),
        educationType: educationType.trim(),
        currentSchoolCollegeName: currentSchoolCollegeName.trim(),
        currentClassSemester: currentClassSemester.trim(),
        whatsappNumber: whatsappNumber?.trim() || null,
        callingNumber: callingNumber?.trim() || null,
        parentGuardianContactNumber: parentGuardianContactNumber.trim(),
        background: background.trim(),
        interests: Array.isArray(interests) ? interests.map((i: string) => i.trim()) : [],
        concerns: Array.isArray(concerns) ? concerns.map((c: string) => c.trim()) : [],
        language: language.trim(),
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating child:', updateError);
      return NextResponse.json({ error: 'Failed to update child profile' }, { status: 500 });
    }

    // Invalidate static RAG context cache for this child
    staticContextCache.delete(id);

    return NextResponse.json({
      message: 'Child profile updated successfully',
      child: updatedChild
    });

  } catch (error) {
    console.error('Error updating child:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Soft delete a child profile
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from authorization header
    const { user, error: userError } = await getUserFromAuthHeader(request);
    if (userError || !user) {
      console.error('User error:', userError);
      return NextResponse.json({ error: 'No valid session' }, { status: 401 });
    }

    // Check if user is admin
    const userRole = user.user_metadata?.role || user.app_metadata?.role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Only administrators can delete child profiles.' }, { status: 401 });
    }

    const { id } = params;

    // Create admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check if child exists
    const { data: existingChild, error: existingError } = await supabaseAdmin
      .from('children')
      .select('*')
      .eq('id', id)
      .eq('isActive', true)
      .single();

    if (existingError || !existingChild) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // Soft delete the child (set isActive to false)
    const { error: updateError } = await supabaseAdmin
      .from('children')
      .update({
        isActive: false,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error soft deleting child:', updateError);
      return NextResponse.json({ error: 'Failed to delete child profile' }, { status: 500 });
    }

    // Also deactivate any active assignments
    const { error: assignmentError } = await supabaseAdmin
      .from('assignments')
      .update({
        isActive: false
      })
      .eq('child_id', id)
      .eq('isActive', true);

    if (assignmentError) {
      console.error('Error deactivating assignments:', assignmentError);
      // Don't fail the request if assignment deactivation fails
    }

    return NextResponse.json({
      message: 'Child profile deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting child:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
