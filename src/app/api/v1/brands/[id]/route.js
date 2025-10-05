import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/v1/brands/[id] - Get single brand
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const brand = await prisma.brand.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        logo: true,
        active: true,        // ✅ Correct field name
        models: true,        // ✅ Available in your schema
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!brand) {
      return NextResponse.json(
        { message: "Brand not found", statusCode: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Brand fetched successfully",
      brand: brand,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json(
      { message: "Failed to fetch brand", statusCode: 500 },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/v1/brands/[id] - Update brand
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { name, logo, active } = await request.json();

    console.log('Request body:', { name, logo, active });

    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id }
    });

    if (!existingBrand) {
      return NextResponse.json(
        { message: "Brand not found", statusCode: 404 },
        { status: 404 }
      );
    }

    // Check if name is taken by another brand
    if (name && name !== existingBrand.name) {
      const nameConflict = await prisma.brand.findUnique({
        where: { name }
      });

      if (nameConflict) {
        return NextResponse.json(
          { message: "Brand name already exists", statusCode: 409 },
          { status: 409 }
        );
      }
    }

    const updatedBrand = await prisma.brand.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(logo !== undefined && { logo }),
        ...(active !== undefined && { active }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        logo: true,
        active: true,      // ✅ Matches your schema exactly
        createdAt: true,
        updatedAt: true,
        // ❌ Removed: description (doesn't exist in your Brand model)
        // ❌ Removed: is_active (your field is named 'active')
      }
    });

    return NextResponse.json({
      message: "Brand updated successfully",
      brand: updatedBrand,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error updating brand:', error);
    return NextResponse.json(
      { message: "Failed to update brand", statusCode: 500 },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/v1/brands/[id] - Delete brand
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id }
    });

    if (!existingBrand) {
      return NextResponse.json(
        { message: "Brand not found", statusCode: 404 },
        { status: 404 }
      );
    }

    // Check if brand has models before deleting (referential integrity)
    const modelsCount = await prisma.model.count({
      where: { brandId: id }
    });

    if (modelsCount > 0) {
      return NextResponse.json(
        { message: "Cannot delete brand with existing models", statusCode: 400 },
        { status: 400 }
      );
    }

    await prisma.brand.delete({
      where: { id }
    });

    return NextResponse.json({
      message: "Brand deleted successfully",
      statusCode: 200
    });
  } catch (error) {
    console.error('Error deleting brand:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: "Brand not found", statusCode: 404 },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: "Failed to delete brand", statusCode: 500 },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}