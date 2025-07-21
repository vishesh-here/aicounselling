import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No valid session' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Create Supabase client with service role key for server-side operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Get today's date
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    // Fetch children with birthdays today
    const { data: children, error } = await supabase
      .from('children')
      .select('id, fullName, dateOfBirth, currentCity')
      .eq('isActive', true);

    if (error) {
      console.error('Error fetching children:', error);
      return NextResponse.json({ error: 'Failed to fetch children' }, { status: 500 });
    }

    // Filter children whose birthday is today
    const todayBirthdays = children?.filter((child: any) => {
      if (!child.dateOfBirth) return false;
      const birthDate = new Date(child.dateOfBirth);
      return birthDate.getMonth() === currentMonth && birthDate.getDate() === currentDay;
    }).map((child: any) => {
      const birthDate = new Date(child.dateOfBirth);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
      
      return {
        ...child,
        age: actualAge
      };
    }) || [];

    return NextResponse.json({ 
      birthdayChildren: todayBirthdays,
      count: todayBirthdays.length 
    });

  } catch (error) {
    console.error('Error in birthday notifications API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 