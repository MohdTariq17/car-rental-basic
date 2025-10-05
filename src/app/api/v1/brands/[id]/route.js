import { prisma } from '../../../../../lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/v1/brands/[id] - Get single brand
export async function GET(request, { params }) {
  try {
    const brand = await prisma.brand.findUnique({
      where: { id: params.id },
      include: {
        models: true
      }
    });
    
    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
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
    const data = await request.json();
    const brand = await prisma.brand.update({
      where: { id: params.id },
      data
    });
    
    return NextResponse.json({
      message: "Brand updated successfully",
      brand: brand,
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
    await prisma.brand.delete({
      where: { id: params.id }
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
