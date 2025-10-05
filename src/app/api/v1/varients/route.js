import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/v1/variants - Fetch all variants
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('modelId');
    const active = searchParams.get('active');

    // Build where clause
    const where = {};
    if (modelId) where.modelId = modelId;
    if (active !== null && active !== undefined) {
      where.active = active === 'true';
    }

    const variants = await prisma.variant.findMany({
      where,
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
      },
      orderBy: [
        { model: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({
      message: "Variants fetched successfully",
      variants: variants,
      count: variants.length,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error fetching variants:', error);
    return NextResponse.json(
      { message: "Failed to fetch variants", error: error.message, statusCode: 500 },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/v1/variants - Create new variant
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      name, 
      modelId, 
      fuelType, 
      transmission, 
      seatingCapacity, 
      active = true 
    } = body;

    if (!name || !modelId) {
      return NextResponse.json(
        { message: "Name and modelId are required", statusCode: 400 },
        { status: 400 }
      );
    }

    const variant = await prisma.variant.create({
      data: {
        name,
        modelId,
        fuelType,
        transmission,
        seatingCapacity: seatingCapacity ? parseInt(seatingCapacity) : null,
        active
      },
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
      message: "Variant created successfully",
      variant: variant,
      statusCode: 201
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating variant:', error);
    return NextResponse.json(
      { message: "Failed to create variant", error: error.message, statusCode: 500 },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}