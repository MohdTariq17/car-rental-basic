import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../../generated/client';
import { generateToken, verifyToken } from '../../../util/jwt';

const prisma = new PrismaClient();

// LOGIN
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
        { message: "Invalid credentials", statusCode: 401 },
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

// REGISTER
export async function PUT(request) {
  try {
    const { email, password, name, role } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "Email, password, and name are required", statusCode: 400 },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['USER', 'ADMIN', 'HOSTER', 'DRIVER', 'MECHANIC', 'CUSTOMER', 'MANAGER'];
    const userRole = role && validRoles.includes(role.toUpperCase()) ? role.toUpperCase() : 'ADMIN';

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

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: userRole,
        is_active: true,
      },
    });

    // Generate token for immediate login
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
    
    const token = await generateToken(tokenPayload);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json({
      message: "User created and logged in successfully",
      data: {
        token,
        user: userWithoutPassword
      },
      statusCode: 201
    });

    // Set secure cookie
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400,
      path: '/'
    });

    return response;

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

// TOKEN VERIFICATION
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('authToken')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: "No token provided", statusCode: 401 },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    
    // Get fresh user data
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        is_active: true
      }
    });

    if (!user || !user.is_active) {
      return NextResponse.json(
        { message: "User not found or inactive", statusCode: 401 },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: "Token valid",
      data: { user },
      statusCode: 200
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { message: "Invalid token", statusCode: 401 },
      { status: 401 }
    );
  } finally {
    await prisma.$disconnect();
  }
}