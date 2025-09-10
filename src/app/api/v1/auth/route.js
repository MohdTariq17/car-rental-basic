import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../../generated/client';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../../util/jwt';

// Initialize Prisma client with better error handling for Vercel
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.prisma;
}

export async function POST(request) {
  try {
    console.log('Auth POST request received');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Database URL exists:', !!process.env.DB_URL);
    
    // Check if Prisma is initialized
    if (!prisma) {
      console.error('Prisma client not initialized');
      return NextResponse.json({
        message: "Database connection error",
        statusCode: 500,
        error: "Database client initialization failed"
      }, {
        status: 500
      });
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json({
        message: "Invalid request body",
        statusCode: 400,
        error: "Request body must be valid JSON"
      }, {
        status: 400
      });
    }

    console.log('Request body parsed successfully');
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json({
        message: "Email and password are required",
        statusCode: 400,
        error: "Missing required fields"
      }, {
        status: 400
      });
    }

    console.log('Searching for user with email:', email);

    // Find user with better error handling
    let user;
    try {
      user = await prisma.user.findUnique({
        where: {
          email: email.toLowerCase().trim()
        }
      });
      console.log('User query completed, user found:', !!user);
    } catch (dbError) {
      console.error('Database query error:', dbError);
      return NextResponse.json({
        message: "Database query failed",
        statusCode: 500,
        error: process.env.NODE_ENV === 'development' ? dbError.message : "Database error"
      }, {
        status: 500
      });
    }

    if (!user) {
      console.log('User not found');
      return NextResponse.json({
        message: "Invalid credentials",
        statusCode: 401,
        error: "User not found"
      }, {
        status: 401
      });
    }

    // Check if user is active
    if (!user.is_active) {
      console.log('User account is deactivated');
      return NextResponse.json({
        message: "Account is deactivated",
        statusCode: 403,
        error: "Account disabled"
      }, {
        status: 403
      });
    }

    console.log('Verifying password');
    
    // Verify password
    let isPasswordValid;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Password verification completed, valid:', isPasswordValid);
    } catch (bcryptError) {
      console.error('Password verification error:', bcryptError);
      return NextResponse.json({
        message: "Authentication error",
        statusCode: 500,
        error: "Password verification failed"
      }, {
        status: 500
      });
    }

    if (!isPasswordValid) {
      console.log('Invalid password');
      return NextResponse.json({
        message: "Invalid credentials",
        statusCode: 401,
        error: "Invalid password"
      }, {
        status: 401
      });
    }

    console.log('Generating token');
    
    // Generate token
    let token;
    try {
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };
      token = await generateToken(tokenPayload);
      console.log('Token generated successfully');
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      return NextResponse.json({
        message: "Token generation failed",
        statusCode: 500,
        error: "Authentication token creation failed"
      }, {
        status: 500
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Create response
    const responseData = {
      message: "Login successful",
      data: {
        token,
        user: userWithoutPassword
      },
      statusCode: 200
    };

    const response = NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Set HTTP-only cookie
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

    // Ensure we always return a valid JSON response
    return NextResponse.json({
      message: "Internal server error",
      statusCode: 500,
      error: process.env.NODE_ENV === 'development' ? error.message : "Something went wrong"
    }, {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } finally {
    // Only disconnect in serverless environments to avoid connection issues
    if (process.env.NODE_ENV === 'production') {
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        console.error('Prisma disconnect error:', disconnectError);
      }
    }
  }
}