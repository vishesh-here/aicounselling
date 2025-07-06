import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Cookie: cookieStore.toString() } },
  });
  return supabase;
}

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const supabase = getSupabase(request);
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || user.user_metadata.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const { action, child_id, volunteerId, assignment_id } = body;
  if (action === 'assign') {
    // Check if assignment already exists
    const { data: existing, error: existError } = await supabase
      .from('assignments')
      .select('*')
      .eq('child_id', child_id)
      .eq('volunteerId', volunteerId)
      .eq('isActive', true)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ error: 'Assignment already exists for this volunteer and child' }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('assignments')
      .insert([{ child_id, volunteerId, isActive: true }])
      .select();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: 'Assignment created successfully', assignment: data[0] });
  }
  if (action === 'remove' && assignment_id) {
    const { data, error } = await supabase
      .from('assignments')
      .update({ isActive: false })
      .eq('id', assignment_id)
      .select();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: 'Assignment removed successfully', assignment: data[0] });
  }
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase(request);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || user.user_metadata.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assignments = await prisma.assignment.findMany({
      where: { isActive: true },
      include: {
        child: {
          select: { id: true, name: true, age: true, state: true }
        },
        volunteer: {
          select: { id: true, name: true, email: true, specialization: true }
        }
      },
      orderBy: { assignedAt: "desc" }
    });

    // Filter out assignments with missing child or volunteer relations
    const filteredAssignments = assignments.filter(a => a.child && a.volunteer);

    return NextResponse.json({ assignments: filteredAssignments });

  } catch (error) {
    console.error("Assignment fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
