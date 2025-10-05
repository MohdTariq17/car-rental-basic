import { prisma } from ../../../../../lib/prisma;
import { NextResponse } from 'next/server';


import { prisma } from "../../../../lib/prisma";

// GET /api/v1/brands - Fetch all brands
export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      select: {
        id: true,
        name: true,
        logo: true,
        active: true,      // ✅ Correct field name from your schema
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { models: true }  // ✅ Count related models
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      message: "Brands fetched successfully",
      brands: brands,
      count: brands.length,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json(
      { message: "Failed to fetch brands", error: error.message, statusCode: 500 },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/v1/brands - Create new brand
export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Request body:', body);

    const { name, logo, active } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: "Brand name is required", statusCode: 400 },
        { status: 400 }
      );
    }

    // Check if brand already exists
    const existingBrand = await prisma.brand.findUnique({
      where: { name: name.trim() }
    });

    if (existingBrand) {
      return NextResponse.json(
        { message: "Brand already exists", statusCode: 409 },
        { status: 409 }
      );
    }

    // Create brand
    const brand = await prisma.brand.create({
      data: {
        name: name.trim(),
        logo: logo || null,
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json({
      message: "Brand created successfully",
      brand: {
        id: brand.id,
        name: brand.name,
        logo: brand.logo,
        active: brand.active,    // ✅ Correct field name
      },
      statusCode: 201
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating brand:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: "Brand name already exists", statusCode: 409 },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create brand", error: error.message, statusCode: 500 },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}