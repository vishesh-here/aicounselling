
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, state, specialization, experience, motivation } = body;

    // Validation
    const errors: { [key: string]: string } = {};

    if (!name?.trim()) {
      errors.name = 'Full name is required';
    }

    if (!email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (!phone?.trim()) {
      errors.phone = 'Phone number is required';
    }

    if (!state) {
      errors.state = 'Please select your state';
    }

    if (!specialization) {
      errors.specialization = 'Please select your area of specialization';
    }

    if (!experience?.trim()) {
      errors.experience = 'Please describe your experience';
    } else if (experience.length < 20) {
      errors.experience = 'Please provide more details about your experience';
    }

    if (!motivation?.trim()) {
      errors.motivation = 'Please explain your motivation';
    } else if (motivation.length < 20) {
      errors.motivation = 'Please provide more details about your motivation';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { errors: { email: 'An account with this email already exists' } },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with PENDING approval status
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone.trim(),
        state: state,
        specialization: specialization,
        experience: experience.trim(),
        motivation: motivation.trim(),
        role: 'VOLUNTEER',
        approvalStatus: 'PENDING',
        isActive: false // Inactive until approved
      }
    });

    // Return success response (without sensitive data)
    return NextResponse.json({
      message: 'Registration successful. Your application is pending admin approval.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        approvalStatus: user.approvalStatus
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
