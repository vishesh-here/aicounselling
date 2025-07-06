import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  // Fetch all concerns and children
  const { data: concerns, error: concernsError } = await supabase
    .from('concerns')
    .select('id, category, child_id');
  const { data: children, error: childrenError } = await supabase
    .from('children')
    .select('id, age, isActive');
  if (concernsError || childrenError) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
  // Group by age group and category
  const analytics: any[] = [];
  (concerns || []).forEach((concern: any) => {
    const child = (children || []).find((c: any) => c.id === concern.child_id && c.isActive);
    if (!child) return;
    let age_group = '';
    if (child.age >= 6 && child.age <= 10) age_group = '6-10';
    else if (child.age >= 11 && child.age <= 13) age_group = '11-13';
    else if (child.age >= 14 && child.age <= 16) age_group = '14-16';
    else age_group = '17+';
    const existing = analytics.find(a => a.age_group === age_group && a.category === concern.category);
    if (existing) existing.count += 1;
    else analytics.push({ age_group, category: concern.category, count: 1 });
  });
  return NextResponse.json({ data: analytics });
} 