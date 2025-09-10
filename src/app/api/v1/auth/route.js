import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { generateToken, verifyToken } from '../../../util/jwt';
import { PrismaClient } from '../../../../../generated/client';

const prisma = new PrismaClient();

// LOGIN
export async function POST(request) {
  try {
    console.log('Auth POST request received');
    
    const body = await request.json();
    console.log('Request body:', { email: body.email, hasPassword: !!body.password });
    
    const { email, password } = body;
    
    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { message: "Email and password are required", statusCode: 400 },
        { status: 400 }
      );
    }

    console.log('Searching for user with email:', email);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    
    console.log('User found:', !!user);
    
    if (!user) {
      console.log('User not found');
      return NextResponse.json(
        { message: "Invalid credentials", statusCode: 401 },
        { status: 401 }
      );
    }
    
    // Check if user is active
    if (!user.is_active) {
      console.log('User account is deactivated');
      return NextResponse.json(
        { message: "Account is deactivated", statusCode: 403 },
        { status: 403 }
      );
    }
    
    console.log('Verifying password');
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Invalid password');
      return NextResponse.json(
        { message: "Invalid credentials", statusCode: 401 },
        { status: 401 }
      );
    }
    
    console.log('Generating token');
    
    // Generate token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
    
    const token = await generateToken(tokenPayload);
    
    console.log('Token generated successfully');
    
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
    
    console.log('Login successful for user:', email);
    return response;
    
  } catch (error) {
    console.error('Auth error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json(
      { 
        message: "Internal server error", 
        statusCode: 500,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// REGISTER
export async function PUT(request) {
  try {
    console.log('Auth PUT request received');
    
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
      where: { email: email.toLowerCase().trim() }
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
        email: email.toLowerCase().trim(),
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
      { 
        message: "Internal server error", 
        statusCode: 500,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
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
    console.error('Token verification error:', error);
    return NextResponse.json(
      { message: "Invalid token", statusCode: 401 },
      { status: 401 }
    );
  }
}