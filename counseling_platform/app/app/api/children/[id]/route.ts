
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch a specific child by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Build filter conditions based on user role
    const where: any = {
      id: id,
      isActive: true
    };

    // For volunteers, only show assigned children
    if (session.user.role === 'VOLUNTEER') {
      where.assignments = {
        some: {
          volunteerId: session.user.id,
          isActive: true
        }
      };
    }

    const child = await prisma.child.findFirst({
      where,
      include: {
        assignments: {
          where: { isActive: true },
          include: {
            volunteer: {
              select: {
                id: true,
                name: true,
                specialization: true
              }
            }
          }
        },
        concerns: {
          where: { status: { not: 'CLOSED' } },
          orderBy: { createdAt: 'desc' }
        },
        sessions: {
          orderBy: { createdAt: 'desc' },
          include: {
            volunteer: {
              select: {
                name: true
              }
            },
            summary: true
          }
        }
      }
    });

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    return NextResponse.json({ child });

  } catch (error) {
    console.error('Error fetching child:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update a child profile
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Only administrators can update child profiles.' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const {
      name,
      age,
      gender,
      state,
      district,
      background,
      schoolLevel,
      interests,
      challenges,
      language
    } = body;

    // Validation
    const errors: { [key: string]: string } = {};

    if (!name?.trim()) {
      errors.name = 'Child name is required';
    }

    if (!age || age < 5 || age > 18) {
      errors.age = 'Age must be between 5 and 18 years';
    }

    if (!gender || !['MALE', 'FEMALE', 'OTHER'].includes(gender)) {
      errors.gender = 'Please select a valid gender';
    }

    if (!state?.trim()) {
      errors.state = 'State is required';
    }

    if (!district?.trim()) {
      errors.district = 'District is required';
    }

    if (!background?.trim()) {
      errors.background = 'Background information is required';
    }

    if (!schoolLevel?.trim()) {
      errors.schoolLevel = 'School level is required';
    }

    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      errors.interests = 'At least one interest is required';
    }

    if (!challenges || !Array.isArray(challenges) || challenges.length === 0) {
      errors.challenges = 'At least one challenge is required';
    }

    if (!language?.trim()) {
      errors.language = 'Preferred language is required';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Check if child exists
    const existingChild = await prisma.child.findFirst({
      where: {
        id: id,
        isActive: true
      }
    });

    if (!existingChild) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // Check if another child with same name, age, and district already exists (excluding current child)
    const duplicateChild = await prisma.child.findFirst({
      where: {
        name: name.trim(),
        age: age,
        district: district.trim(),
        isActive: true,
        id: { not: id }
      }
    });

    if (duplicateChild) {
      return NextResponse.json(
        { errors: { name: 'A child with the same name, age, and district already exists' } },
        { status: 400 }
      );
    }

    // Update the child profile
    const updatedChild = await prisma.child.update({
      where: { id: id },
      data: {
        name: name.trim(),
        age: age,
        gender: gender,
        state: state.trim(),
        district: district.trim(),
        background: background.trim(),
        schoolLevel: schoolLevel.trim(),
        interests: interests.map((i: string) => i.trim()),
        challenges: challenges.map((c: string) => c.trim()),
        language: language.trim(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Child profile updated successfully',
      child: {
        id: updatedChild.id,
        name: updatedChild.name,
        age: updatedChild.age,
        gender: updatedChild.gender,
        state: updatedChild.state,
        district: updatedChild.district
      }
    });

  } catch (error) {
    console.error('Error updating child:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Soft delete a child profile
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Only administrators can delete child profiles.' }, { status: 401 });
    }

    const { id } = params;

    // Check if child exists
    const existingChild = await prisma.child.findFirst({
      where: {
        id: id,
        isActive: true
      }
    });

    if (!existingChild) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // Soft delete the child (set isActive to false)
    await prisma.child.update({
      where: { id: id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    // Also deactivate any active assignments
    await prisma.assignment.updateMany({
      where: {
        childId: id,
        isActive: true
      },
      data: {
        isActive: false
      }
    });

    return NextResponse.json({
      message: 'Child profile deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting child:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
