
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch all children with optional filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const state = searchParams.get('state');
    const gender = searchParams.get('gender');
    const ageMin = searchParams.get('ageMin');
    const ageMax = searchParams.get('ageMax');
    const assignedOnly = searchParams.get('assignedOnly');

    // Build filter conditions
    const where: any = {
      isActive: true
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
        { interests: { hasSome: [search] } },
        { challenges: { hasSome: [search] } }
      ];
    }

    if (state) {
      where.state = state;
    }

    if (gender) {
      where.gender = gender;
    }

    if (ageMin) {
      where.age = { ...where.age, gte: parseInt(ageMin) };
    }

    if (ageMax) {
      where.age = { ...where.age, lte: parseInt(ageMax) };
    }

    // Handle assignment filtering
    if (session.user.role === 'VOLUNTEER' && assignedOnly === 'true') {
      where.assignments = {
        some: {
          volunteerId: session.user.id,
          isActive: true
        }
      };
    }

    const children = await prisma.child.findMany({
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
          orderBy: { createdAt: 'desc' },
          take: 3
        },
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            volunteer: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ children });

  } catch (error) {
    console.error('Error fetching children:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create a new child profile
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Only administrators can create child profiles.' }, { status: 401 });
    }

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

    // Check if child with same name, age, and district already exists
    const existingChild = await prisma.child.findFirst({
      where: {
        name: name.trim(),
        age: age,
        district: district.trim(),
        isActive: true
      }
    });

    if (existingChild) {
      return NextResponse.json(
        { errors: { name: 'A child with the same name, age, and district already exists' } },
        { status: 400 }
      );
    }

    // Create the child profile
    const child = await prisma.child.create({
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
        isActive: true
      }
    });

    return NextResponse.json({
      message: 'Child profile created successfully',
      child: {
        id: child.id,
        name: child.name,
        age: child.age,
        gender: child.gender,
        state: child.state,
        district: child.district
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating child:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
