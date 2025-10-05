import { NextResponse } from 'next/server';

import bcrypt from 'bcryptjs';

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

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { username, email, name, role, password } = body;

    // Validation
    if (!username || !email || !name || !role) {
      return NextResponse.json(
        { message: "All fields except password are required", statusCode: 400 },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "User not found", statusCode: 404 },
        { status: 404 }
      );
    }

    // Check if username or email is taken by another user
    const duplicateUser = await prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              { username: username },
              { email: email }
            ]
          }
        ]
      }
    });

    if (duplicateUser) {
      return NextResponse.json(
        { message: "Username or email already taken by another user", statusCode: 400 },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData = {
      username,
      email,
      name,
      role: role.toUpperCase() // Convert to enum value (ADMIN, USER, PROVIDER)
    };

    // Only update password if provided
    if (password && password.trim()) {
      const hashedPassword = await bcrypt.hash(password, 12);
      updateData.password = hashedPassword;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        is_active: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: "Failed to update user", error: error.message, statusCode: 500 },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "User not found", statusCode: 404 },
        { status: 404 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({
      message: "User deleted successfully",
      statusCode: 200
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { message: "Failed to delete user", error: error.message, statusCode: 500 },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        is_active: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found", statusCode: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { message: "Failed to fetch user", error: error.message, statusCode: 500 },
      { status: 500 }
    );
  }
}