import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../../generated/client';

// Create a singleton instance
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }
  prisma = global.__prisma;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const take = parseInt(searchParams.get('limit') || '10');
    const sortField = searchParams.get('sortField') || 'created_at'; // Fixed field name
    const sortOrder = parseInt(searchParams.get('sortOrder') || '-1');
    const filters = JSON.parse(searchParams.get('filters') || '{}');

    // Build where clause
    const where = {};
    
    if (filters.role) {
      where.role = filters.role.toUpperCase();
    }
    
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { username: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    // Build orderBy - use correct field names
    const orderBy = {};
    // Map frontend field names to database field names
    const fieldMapping = {
      'createdAt': 'created_at',
      'updatedAt': 'updated_at',
      'isActive': 'is_active'
    };
    
    const dbField = fieldMapping[sortField] || sortField;
    orderBy[dbField] = sortOrder === 1 ? 'asc' : 'desc';

    // Get users
    const users = await prisma.user.findMany({
      where,
      skip,
      take,
      orderBy,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        mobile: true,
        role: true,
        is_active: true,
        email_verified: true,
        mobile_verified: true,
        created_at: true,
        updated_at: true,
      },
    });

    // Get total count
    const totalCount = await prisma.user.count({ where });

    // Transform response to match frontend expectations
    const transformedUsers = users.map(user => ({
      ...user,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      isActive: user.is_active,
      emailVerified: user.email_verified,
      mobileVerified: user.mobile_verified
    }));

    return NextResponse.json({
      success: true,
      users: transformedUsers,
      totalCount,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, mobile, username, password, role } = body;

    // Validation
    if (!name || !email || !mobile || !username || !password || !role) {
      return NextResponse.json(
        { message: "All fields are required", statusCode: 400 },
        { status: 400 }
      );
    }

    // Check for existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username },
          { mobile: mobile }
        ]
      }
    });

    if (existingUser) {
      let field = 'field';
      if (existingUser.email === email) field = 'email';
      else if (existingUser.username === username) field = 'username';
      else if (existingUser.mobile === mobile) field = 'mobile';
      
      return NextResponse.json(
        { message: `User with this ${field} already exists`, statusCode: 400 },
        { status: 400 }
      );
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        mobile: mobile.trim(),
        username: username.toLowerCase().trim(),
        password: password,
        role: role.toUpperCase(),
        is_active: true,
        email_verified: false,
        mobile_verified: false
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        mobile: true,
        role: true,
        is_active: true,
        email_verified: true,
        mobile_verified: true,
        created_at: true,
        updated_at: true,
      }
    });

    // Transform response
    const transformedUser = {
      ...newUser,
      createdAt: newUser.created_at,
      updatedAt: newUser.updated_at,
      isActive: newUser.is_active,
      emailVerified: newUser.email_verified,
      mobileVerified: newUser.mobile_verified
    };

    return NextResponse.json({
      message: "User created successfully",
      user: transformedUser,
      statusCode: 201
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: "Failed to create user", error: error.message, statusCode: 500 },
      { status: 500 }
    );
  }
}
