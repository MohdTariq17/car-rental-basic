import { prisma } from '../../../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const variant = await prisma.variant.findUnique({
      where: { id },
      include: {
        model: {
          include: {
            brand: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });
    
    if (!variant) {
      return NextResponse.json({ 
        success: false, 
        error: 'Variant not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: variant
    });
  } catch (error) {
    console.error('Error fetching variant:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch variant' 
    }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const { name, modelId, fuelType, transmission, seatingCapacity, active } = data;
    
    const variant = await prisma.variant.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(modelId && { modelId }),
        ...(fuelType !== undefined && { fuelType: fuelType?.trim() || null }),
        ...(transmission !== undefined && { transmission: transmission?.trim() || null }),
        ...(seatingCapacity !== undefined && { seatingCapacity: seatingCapacity ? parseInt(seatingCapacity) : null }),
        ...(active !== undefined && { active })
      },
      include: {
        model: {
          include: {
            brand: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      data: variant
    });
  } catch (error) {
    console.error('Error updating variant:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update variant' 
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    await prisma.variant.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: "Variant deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting variant:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ 
        success: false, 
        error: 'Variant not found' 
      }, { status: 404 });
    }
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete variant' 
    }, { status: 500 });
  }
}
