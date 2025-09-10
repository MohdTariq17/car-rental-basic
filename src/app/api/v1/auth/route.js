import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { PrismaClient } from '../../../../../generated/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    // Validate input FIRST
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required", statusCode: 400 },
        { status: 400 }
      );
    }

    // Then query database
    const userFromDb = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!userFromDb) {
      return NextResponse.json(
        { message: "Invalid Email or Password", statusCode: 401 },
        { status: 401 }
      );
    }
    
    // Check if user is active
    if (!userFromDb.is_active) {
      return NextResponse.json(
        { message: "Account is deactivated", statusCode: 403 },
        { status: 403 }
      );
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, userFromDb.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid Email or Password", statusCode: 401 },
        { status: 401 }
      );
    }
    
    // Generate token with actual user data using jose
    const tokenPayload = {
      userId: userFromDb.id,
      email: userFromDb.email,
      name: userFromDb.name,
      role: userFromDb.role
    };
    
    const token = await generateToken(tokenPayload);
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = userFromDb;
    
    // Set HTTP-only cookie for better security
    const response = NextResponse.json({
      message: "Login Successful",
      data: {
        token,
        user: userWithoutPassword
      },
      statusCode: 200
    });

    // Set secure cookie
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 24 hours
      path: '/'
    });
    
    return response;
    
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { message: "Internal server error", statusCode: 500 },
      { status: 500 }
    );
  } finally {
    // Always disconnect Prisma
    await prisma.$disconnect();
  }
}