import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('modelId');
    
    const whereClause = modelId ? { modelId } : {};
    
    const variants = await prisma.variant.findMany({
      where: whereClause,
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
      },
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json({
      success: true,
      data: variants
    });
  } catch (error) {
    console.error('Error fetching variants:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch variants' 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, modelId, fuelType, transmission, seatingCapacity } = data;
    
    if (!name || !modelId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name and modelId are required' 
      }, { status: 400 });
    }
    
    const variant = await prisma.variant.create({
      data: {
        name: name.trim(),
        modelId,
        fuelType: fuelType?.trim() || null,
        transmission: transmission?.trim() || null,
        seatingCapacity: seatingCapacity ? parseInt(seatingCapacity) : null
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
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating variant:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create variant' 
    }, { status: 500 });
  }
}