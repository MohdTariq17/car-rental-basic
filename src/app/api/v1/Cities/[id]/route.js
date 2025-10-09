
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

// GET - Fetch a single city
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const city = await prisma.city.findUnique({
      where: { id },
      include: {
        state: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    if (!city) {
      return NextResponse.json({
        success: false,
        error: 'City not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: city.id,
        name: city.name,
        code: city.code,
        state: city.state?.name || 'Unknown',
        stateId: city.stateId,
        status: city.active ? 'Active' : 'Inactive',
        active: city.active,
        createdAt: city.createdAt,
        updatedAt: city.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching city:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch city'
    }, { status: 500 });
  }
}

// PUT - Update a city
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, stateId, code, active } = body;

    if (!name || !stateId || !code) {
      return NextResponse.json({
        success: false,
        error: 'Name, state, and code are required'
      }, { status: 400 });
    }

    // Check if city exists
    const existingCity = await prisma.city.findUnique({
      where: { id }
    });

    if (!existingCity) {
      return NextResponse.json({
        success: false,
        error: 'City not found'
      }, { status: 404 });
    }

    // Check if another city with the same name exists in the same state or same code exists
    const duplicateCity = await prisma.city.findFirst({
      where: {
        OR: [
          {
            name: {
              equals: name,
              mode: 'insensitive'
            },
            stateId: stateId,
            id: {
              not: id
            }
          },
          {
            code: {
              equals: code,
              mode: 'insensitive'
            },
            id: {
              not: id
            }
          }
        ]
      }
    });

    if (duplicateCity) {
      if (duplicateCity.code.toLowerCase() === code.toLowerCase()) {
        return NextResponse.json({
          success: false,
          error: 'City code already exists'
        }, { status: 409 });
      } else {
        return NextResponse.json({
          success: false,
          error: 'Another city with this name already exists in this state'
        }, { status: 409 });
      }
    }

    const updatedCity = await prisma.city.update({
      where: { id },
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        stateId,
        active: active !== undefined ? active : existingCity.active
      },
      include: {
        state: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedCity.id,
        name: updatedCity.name,
        code: updatedCity.code,
        state: updatedCity.state?.name || 'Unknown',
        stateId: updatedCity.stateId,
        status: updatedCity.active ? 'Active' : 'Inactive',
        active: updatedCity.active,
        createdAt: updatedCity.createdAt,
        updatedAt: updatedCity.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating city:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'City code must be unique'
      }, { status: 409 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update city'
    }, { status: 500 });
  }
}

// DELETE - Delete a city
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if city exists
    const existingCity = await prisma.city.findUnique({
      where: { id }
    });

    if (!existingCity) {
      return NextResponse.json({
        success: false,
        error: 'City not found'
      }, { status: 404 });
    }

    // Check if city is being used by providers or other entities
    const providerCount = await prisma.provider.count({
      where: { cityId: id }
    });

    if (providerCount > 0) {
      return NextResponse.json({
        success: false,
        error: `Cannot delete city. It is being used by ${providerCount} provider(s)`
      }, { status: 409 });
    }

    await prisma.city.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'City deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting city:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete city'
    }, { status: 500 });
  }
}
