import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { generateToken, verifyToken } from '../../../util/jwt';
import { PrismaClient } from '../../../../../generated/client';

const prisma = new PrismaClient();

// LOGIN
export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required", statusCode: 400 },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials", statusCode: 401 },
        { status: 401 }
      );
    }
    
    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        { message: "Account is deactivated", statusCode: 403 },
        { status: 403 }
      );
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid credentials", statusCode: 401 },
        { status: 401 }
      );
    }
    
    // Generate token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
    
    const token = await generateToken(tokenPayload);
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    // Set HTTP-only cookie
    const response = NextResponse.json({
      message: "Login successful",
      data: {
        token,
        user: userWithoutPassword
      },
      statusCode: 200
    });

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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
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
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'USER',
        is_active: true
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: "User registered successfully",
      data: userWithoutPassword,
      statusCode: 201
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
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
    
    return NextResponse.json({
      message: "Token is valid",
      data: payload,
      statusCode: 200
    });

  } catch (error) {
    return NextResponse.json(
      { message: "Invalid token", statusCode: 401 },
      { status: 401 }
    );
  }
}