import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/v1/variants/[id] - Fetch single variant
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const variant = await prisma.variant.findUnique({
      where: { id },
      include: {
        model: {
          select: {
            id: true,
            name: true,
            brand: {
              select: {
                id: true,
                name: true,
                logo: true
              }
            }
          }
        }
      }
    });

    if (!variant) {
      return NextResponse.json(
        { message: "Variant not found", statusCode: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Variant fetched successfully",
      variant: variant,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error fetching variant:', error);
    return NextResponse.json(
      { message: "Failed to fetch variant", error: error.message, statusCode: 500 },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/v1/variants/[id] - Update variant
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, modelId, fuelType, transmission, seatingCapacity, active } = body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (modelId !== undefined) updateData.modelId = modelId;
    if (fuelType !== undefined) updateData.fuelType = fuelType;
    if (transmission !== undefined) updateData.transmission = transmission;
    if (seatingCapacity !== undefined) updateData.seatingCapacity = seatingCapacity ? parseInt(seatingCapacity) : null;
    if (active !== undefined) updateData.active = active;

    const variant = await prisma.variant.update({
      where: { id },
      data: updateData,
      include: {
        model: {
          select: {
            id: true,
            name: true,
            brand: {
              select: {
                id: true,
                name: true,
                logo: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      message: "Variant updated successfully",
      variant: variant,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error updating variant:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: "Variant not found", statusCode: 404 },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Failed to update variant", error: error.message, statusCode: 500 },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/v1/variants/[id] - Delete variant
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    await prisma.variant.delete({
      where: { id }
    });

    return NextResponse.json({
      message: "Variant deleted successfully",
      statusCode: 200
    });
  } catch (error) {
    console.error('Error deleting variant:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: "Variant not found", statusCode: 404 },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Failed to delete variant", error: error.message, statusCode: 500 },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}