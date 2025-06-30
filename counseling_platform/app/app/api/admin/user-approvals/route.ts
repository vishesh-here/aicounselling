
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch all users for approval management
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      where: {
        role: 'VOLUNTEER'
      },
      include: {
        approver: {
          select: {
            name: true
          }
        }
      },
      orderBy: [
        { approvalStatus: 'asc' }, // PENDING first
        { createdAt: 'desc' }
      ]
    });

    // Remove sensitive data before sending
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      state: user.state,
      specialization: user.specialization,
      experience: user.experience,
      motivation: user.motivation,
      approvalStatus: user.approvalStatus,
      rejectionReason: user.rejectionReason,
      createdAt: user.createdAt,
      approvedBy: user.approvedBy,
      approvedAt: user.approvedAt,
      approver: user.approver
    }));

    return NextResponse.json({ users: sanitizedUsers });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
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
