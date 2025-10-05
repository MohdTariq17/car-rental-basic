import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/v1/models/[id] - Get single model
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const model = await prisma.model.findUnique({
      where: { id },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        },
        variants: {
          select: {
            id: true,
            name: true,
            fuelType: true,
            transmission: true,
            seatingCapacity: true,
            active: true
          }
        },
        _count: {
          select: { variants: true }
        }
      }
    });

    if (!model) {
      return NextResponse.json(
        { message: "Model not found", statusCode: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Model fetched successfully",
      model: model,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error fetching model:', error);
    return NextResponse.json(
      { message: "Failed to fetch model", statusCode: 500 },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/v1/models/[id] - Update model
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { name, brandId, active } = await request.json();

    console.log('Request body:', { name, brandId, active });

    // Check if model exists
    const existingModel = await prisma.model.findUnique({
      where: { id }
    });

    if (!existingModel) {
      return NextResponse.json(
        { message: "Model not found", statusCode: 404 },
        { status: 404 }
      );
    }

    // Check if brand exists (if brandId is being updated)
    if (brandId && brandId !== existingModel.brandId) {
      const brand = await prisma.brand.findUnique({
        where: { id: brandId }
      });

      if (!brand) {
        return NextResponse.json(
          { message: "Brand not found", statusCode: 404 },
          { status: 404 }
        );
      }
    }

    // Check if name is taken by another model in the same brand
    if (name && name !== existingModel.name) {
      const nameConflict = await prisma.model.findFirst({
        where: { 
          name,
          brandId: brandId || existingModel.brandId,
          NOT: { id }
        }
      });

      if (nameConflict) {
        return NextResponse.json(
          { message: "Model name already exists for this brand", statusCode: 409 },
          { status: 409 }
        );
      }
    }

    const updatedModel = await prisma.model.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(brandId && { brandId }),
        ...(active !== undefined && { active }),
        updatedAt: new Date(),
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        },
        _count: {
          select: { variants: true }
        }
      }
    });

    return NextResponse.json({
      message: "Model updated successfully",
      model: updatedModel,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error updating model:', error);
    return NextResponse.json(
      { message: "Failed to update model", statusCode: 500 },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/v1/models/[id] - Delete model
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Check if model exists
    const existingModel = await prisma.model.findUnique({
      where: { id },
      include: {
        brand: { select: { name: true } }
      }
    });

    if (!existingModel) {
      return NextResponse.json(
        { message: "Model not found", statusCode: 404 },
        { status: 404 }
      );
    }

    // Check if model has variants before deleting (referential integrity)
    const variantsCount = await prisma.variant.count({
      where: { modelId: id }
    });

    if (variantsCount > 0) {
      return NextResponse.json(
        { message: "Cannot delete model with existing variants", statusCode: 400 },
        { status: 400 }
      );
    }

    await prisma.model.delete({
      where: { id }
    });

    return NextResponse.json({
      message: "Model deleted successfully",
      statusCode: 200
    });
  } catch (error) {
    console.error('Error deleting model:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: "Model not found", statusCode: 404 },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: "Failed to delete model", statusCode: 500 },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
