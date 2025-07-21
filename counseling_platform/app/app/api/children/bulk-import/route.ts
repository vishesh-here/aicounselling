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

export async function POST(request: NextRequest) {
  try {
    // Get user from authorization header
    const { user, error: userError } = await getUserFromAuthHeader(request);
    if (userError || !user) {
      console.error('User error:', userError);
      return NextResponse.json({ error: 'No valid session' }, { status: 401 });
    }

    // Check if user is admin
    const userRole = user?.user_metadata?.role || user?.app_metadata?.role;
    if (!user || userRole !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Unauthorized. Only administrators can perform bulk imports.' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { children } = body;

    if (!children || !Array.isArray(children) || children.length === 0) {
      return NextResponse.json({ 
        error: 'No children data provided' 
      }, { status: 400 });
    }

    if (children.length > 100) {
      return NextResponse.json({ 
        error: 'Maximum 100 children can be imported at once' 
      }, { status: 400 });
    }

    // Validate each child record
    const errors: string[] = [];
    const validChildren: any[] = [];

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const rowNumber = i + 1;

      // Required field validation
      const requiredFields = [
        'fullName', 'dateOfBirth', 'gender', 'state', 
        'educationType', 'background', 'language'
      ];
      
      const missingFields = requiredFields.filter(field => !child[field]);
      if (missingFields.length > 0) {
        errors.push(`Row ${rowNumber}: Missing required fields: ${missingFields.join(', ')}`);
        continue;
      }

      // Age validation
      const birthDate = new Date(child.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 5 || age > 20) {
        errors.push(`Row ${rowNumber}: Child must be between 5 and 20 years old (age: ${age})`);
        continue;
      }

      // Gender validation
      if (!['MALE', 'FEMALE'].includes(child.gender)) {
        errors.push(`Row ${rowNumber}: Gender must be MALE or FEMALE`);
        continue;
      }

      // Prepare child data for insertion
      const childData = {
        ...child,
        dateOfBirth: birthDate.toISOString(),
        interests: Array.isArray(child.interests) ? child.interests : [],
        concerns: Array.isArray(child.concerns) ? child.concerns : [],
        isActive: true,
        // Let Supabase handle id, createdAt, updatedAt automatically
      };

      validChildren.push(childData);
    }

    if (errors.length > 0) {
      return NextResponse.json({ 
        error: 'Validation errors found',
        errors 
      }, { status: 400 });
    }

    // Create admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Insert all valid children
    const { data, error } = await supabaseAdmin
      .from('children')
      .insert(validChildren)
      .select();

    if (error) {
      console.error('Error in bulk import:', error);
      return NextResponse.json({ 
        error: `Database error: ${error.message}`,
        details: error
      }, { status: 500 });
    }

    console.log(`Successfully imported ${data.length} children`);

    return NextResponse.json({ 
      successCount: data.length,
      children: data,
      message: `Successfully imported ${data.length} children`
    });

  } catch (error) {
    console.error('Error in bulk import:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 