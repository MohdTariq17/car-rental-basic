
import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../../../generated/prisma-client';

const prisma = new PrismaClient();

// GET - Fetch a specific provider
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const provider = await prisma.user.findFirst({
      where: {
        id,
        role_id: 'provider',
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role_id: true,
        is_active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: provider });
  } catch (error) {
    console.error('Error fetching provider:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update a provider
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, username, email, password } = body;

    // Check if provider exists
    const existingProvider = await prisma.user.findFirst({
      where: {
        id,
        role_id: 'provider',
      },
    });

    if (!existingProvider) {
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Check if username or email already exists (excluding current provider)
    if (username || email) {
      const duplicateUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                username ? { username } : {},
                email ? { email } : {},
              ].filter(obj => Object.keys(obj).length > 0),
            },
          ],
        },
      });

      if (duplicateUser) {
        return NextResponse.json(
          { success: false, error: 'Username or email already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) updateData.password = password; // Note: Hash in production

    const updatedProvider = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role_id: true,
        is_active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedProvider });
  } catch (error) {
    console.error('Error updating provider:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete a provider
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if provider exists
    const existingProvider = await prisma.user.findFirst({
      where: {
        id,
        role_id: 'provider',
      },
    });

    if (!existingProvider) {
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Provider deleted successfully' });
  } catch (error) {
    console.error('Error deleting provider:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}