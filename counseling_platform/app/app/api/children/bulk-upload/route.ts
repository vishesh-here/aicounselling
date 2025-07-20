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

// POST - Bulk upload children via CSV
export async function POST(request: NextRequest) {
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
      return NextResponse.json({ 
        error: 'Unauthorized. Only administrators can perform bulk uploads.' 
      }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'File must be a CSV' }, { status: 400 });
    }

    const csvText = await file.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV must have at least a header and one data row' }, { status: 400 });
    }

    // Parse CSV properly handling quoted values
    function parseCSVLine(line: string): string[] {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim());
      return result.map(field => field.replace(/^"|"$/g, '')); // Remove surrounding quotes
    }

    const headers = parseCSVLine(lines[0]);
    const dataRows = lines.slice(1);

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    const childrenToInsert = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const values = parseCSVLine(row);
      
      if (values.length !== headers.length) {
        results.errors.push(`Row ${i + 2}: Column count mismatch (expected ${headers.length}, got ${values.length})`);
        results.failed++;
        continue;
      }

      const rowData: any = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index];
      });

      // Validate required fields
      const requiredFields = [
        'fullName', 'dateOfBirth', 'gender', 'currentCity', 'state', 
        'educationType', 'currentSchoolCollegeName', 'currentClassSemester', 
        'parentGuardianContactNumber', 'background', 'language'
      ];
      
      const missingFields = requiredFields.filter(field => !rowData[field]);
      if (missingFields.length > 0) {
        results.errors.push(`Row ${i + 2}: Missing required fields: ${missingFields.join(', ')}`);
        results.failed++;
        continue;
      }

      // Validate date of birth
      const birthDate = new Date(rowData.dateOfBirth);
      if (isNaN(birthDate.getTime())) {
        results.errors.push(`Row ${i + 2}: Invalid date format for dateOfBirth`);
        results.failed++;
        continue;
      }

      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 5 || age > 18) {
        results.errors.push(`Row ${i + 2}: Child must be between 5 and 18 years old`);
        results.failed++;
        continue;
      }

      // Parse arrays
      const interests = rowData.interests ? rowData.interests.split(',').map((i: string) => i.trim()) : [];
      const concerns = rowData.concerns ? rowData.concerns.split(',').map((c: string) => c.trim()) : [];

      // Prepare child data
      const childData = {
        fullName: rowData.fullName,
        mothersName: rowData.mothersName || null,
        fathersName: rowData.fathersName || null,
        dateOfBirth: birthDate.toISOString(),
        gender: rowData.gender,
        currentCity: rowData.currentCity,
        state: rowData.state,
        educationType: rowData.educationType,
        currentSchoolCollegeName: rowData.currentSchoolCollegeName,
        currentClassSemester: rowData.currentClassSemester,
        whatsappNumber: rowData.whatsappNumber || null,
        callingNumber: rowData.callingNumber || null,
        parentGuardianContactNumber: rowData.parentGuardianContactNumber,
        background: rowData.background,
        interests,
        concerns,
        language: rowData.language,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      childrenToInsert.push(childData);
    }

    // Insert all valid children
    if (childrenToInsert.length > 0) {
      // Create admin client for database operations
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      const { data, error } = await supabaseAdmin
        .from('children')
        .insert(childrenToInsert)
        .select();

      if (error) {
        return NextResponse.json({ 
          error: `Database error: ${error.message}` 
        }, { status: 500 });
      }

      results.successful = data?.length || 0;
    }

    return NextResponse.json({
      message: `Bulk upload completed. ${results.successful} children added successfully, ${results.failed} failed.`,
      results
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to process CSV file' 
    }, { status: 500 });
  }
} 