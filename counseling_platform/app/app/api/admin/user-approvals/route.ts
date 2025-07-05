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

export async function GET(request: NextRequest) {
  const supabase = getSupabase(request);
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || user.user_metadata.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Fetch all volunteers for approval management
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, phone, state, specialization, experience, motivation, approval_status, rejection_reason, created_at, approved_by, approved_at')
    .eq('role', 'VOLUNTEER');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ users: data });
}

// POST - Approve or reject a user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, action, rejectionReason } = body;

    if (!userId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    if (action === 'reject' && !rejectionReason?.trim()) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
    }

    // Get the user to be updated
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.approvalStatus !== 'PENDING') {
      return NextResponse.json({ error: 'User has already been processed' }, { status: 400 });
    }

    // Update user based on action
    const updateData: any = {
      approvalStatus: action === 'approve' ? 'APPROVED' : 'REJECTED',
      approvedBy: session.user.id,
      approvedAt: new Date()
    };

    if (action === 'approve') {
      updateData.isActive = true;
    } else {
      updateData.rejectionReason = rejectionReason.trim();
      updateData.isActive = false;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        approver: {
          select: {
            name: true
          }
        }
      }
    });

    // Remove sensitive data before sending
    const sanitizedUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      approvalStatus: updatedUser.approvalStatus,
      approvedBy: updatedUser.approvedBy,
      approvedAt: updatedUser.approvedAt,
      rejectionReason: updatedUser.rejectionReason,
      approver: updatedUser.approver
    };

    return NextResponse.json({ 
      message: `User ${action}d successfully`,
      user: sanitizedUser 
    });

  } catch (error) {
    console.error('Error processing user action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
