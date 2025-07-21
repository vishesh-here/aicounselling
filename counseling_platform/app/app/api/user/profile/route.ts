import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        whatsappNumber: true,
        address: true,
        college: true,
        specialization: true,
        city: true,
        state: true,
        preferredLanguages: true,
        experience: true,
        motivation: true,
        role: true,
        approvalStatus: true,
        isActive: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      name, 
      whatsappNumber, 
      address, 
      college, 
      specialization, 
      city, 
      state, 
      preferredLanguages, 
      experience, 
      motivation 
    } = body;

    // Validate required fields
    const errors: { [key: string]: string } = {};

    if (!name?.trim()) {
      errors.name = 'Full name is required';
    }

    if (!whatsappNumber?.trim()) {
      errors.whatsappNumber = 'WhatsApp number is required';
    }

    if (!address?.trim()) {
      errors.address = 'Complete address is required';
    }

    if (!college?.trim()) {
      errors.college = 'College/University is required';
    }

    if (!city?.trim()) {
      errors.city = 'City is required';
    }

    if (!state) {
      errors.state = 'Please select your state';
    }

    if (!specialization) {
      errors.specialization = 'Please select your area of specialization';
    }

    if (!preferredLanguages || preferredLanguages.length === 0) {
      errors.preferredLanguages = 'Please select at least one preferred language';
    }

    if (!experience?.trim()) {
      errors.experience = 'Please describe your experience';
    } else if (experience.length < 20) {
      errors.experience = 'Please provide more details about your experience (minimum 20 characters)';
    }

    if (!motivation?.trim()) {
      errors.motivation = 'Please explain your motivation';
    } else if (motivation.length < 20) {
      errors.motivation = 'Please provide more details about your motivation (minimum 20 characters)';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name.trim(),
        whatsappNumber: whatsappNumber.trim(),
        address: address.trim(),
        college: college.trim(),
        specialization: specialization,
        city: city.trim(),
        state: state,
        preferredLanguages: preferredLanguages,
        experience: experience.trim(),
        motivation: motivation.trim()
      },
      select: {
        id: true,
        email: true,
        name: true,
        whatsappNumber: true,
        address: true,
        college: true,
        specialization: true,
        city: true,
        state: true,
        preferredLanguages: true,
        experience: true,
        motivation: true,
        role: true,
        approvalStatus: true,
        isActive: true
      }
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 