import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../../../../../generated/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email, password, name, role } = await request.json();
    
    // Validate input
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { message: "All fields are required", statusCode: 400 },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists", statusCode: 409 },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        is_active: true
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      message: "User created successfully",
      data: userWithoutPassword,
      statusCode: 201
    }, { status: 201 });

  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json(
      { message: "Internal server error", statusCode: 500 },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_active: true
      }
    });

    return NextResponse.json({
      message: "Users retrieved successfully",
      data: users,
      statusCode: 200
    });

  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json(
      { message: "Internal server error", statusCode: 500 },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}