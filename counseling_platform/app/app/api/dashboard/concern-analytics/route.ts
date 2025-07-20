import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

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

export async function GET(request: NextRequest) {
  try {
    // Get user from authorization header
    const { user, error: userError } = await getUserFromAuthHeader(request);
    if (userError || !user) {
      console.error('User error:', userError);
      return NextResponse.json({ error: 'No valid session' }, { status: 401 });
    }

    // Create admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch all concerns and children
    const { data: concerns, error: concernsError } = await supabaseAdmin
    .from('concerns')
    .select('id, category, child_id');
  const { data: children, error: childrenError } = await supabaseAdmin
    .from('children')
    .select('id, dateOfBirth, isActive');
  if (concernsError || childrenError) {
    console.error('Database errors:', { concernsError, childrenError });
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
  
  // Group by age group and category
  const analytics: any[] = [];
  (concerns || []).forEach((concern: any) => {
    const child = (children || []).find((c: any) => c.id === concern.child_id && c.isActive);
    if (!child) return;
    
    // Calculate age from dateOfBirth
    const birthDate = new Date(child.dateOfBirth);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    
    let age_group = '';
    if (age >= 6 && age <= 10) age_group = '6-10';
    else if (age >= 11 && age <= 13) age_group = '11-13';
    else if (age >= 14 && age <= 16) age_group = '14-16';
    else age_group = '17+';
    
    const existing = analytics.find(a => a.age_group === age_group && a.category === concern.category);
    if (existing) existing.count += 1;
    else analytics.push({ age_group, category: concern.category, count: 1 });
  });
  
  return NextResponse.json({ data: analytics });
  
  } catch (error) {
    console.error('Error in GET /api/dashboard/concern-analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 