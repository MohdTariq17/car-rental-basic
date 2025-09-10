import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../../generated/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email, password, name, role } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "Email, password, and name are required", statusCode: 400 },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists", statusCode: 409 },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with role (default to 'Admin' if not specified)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'Admin',
        is_active: true,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: "User created successfully",
      data: userWithoutPassword,
      statusCode: 201
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: "Email already exists", statusCode: 409 },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error", statusCode: 500 },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}