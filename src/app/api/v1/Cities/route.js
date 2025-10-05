import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma-client';

const prisma = new PrismaClient();

// GET - Fetch cities with optional state filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const stateId = searchParams.get('stateId');
    const active = searchParams.get('active');
    
    let whereClause = {};
    
    if (stateId) {
      whereClause.stateId = stateId;
    }
    
    if (active !== null && active !== undefined) {
      whereClause.active = active === 'true';
    }
    
    const cities = await prisma.city.findMany({
      where: whereClause,
      include: {
        state: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      data: cities.map(city => ({
        id: city.id,
        name: city.name,
        stateId: city.stateId,
        state: city.state,
        pincode: city.pincode,
        active: city.active,
        createdAt: city.createdAt,
        updatedAt: city.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch cities' 
    }, { status: 500 });
  }
}

// POST - Create a new city
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, stateId, pincode, active = true } = body;
    
    if (!name || !stateId) {
      return NextResponse.json({ 
        success: false, 
        error: 'City name and state ID are required' 
      }, { status: 400 });
    }
    
    // Check if state exists
    const stateExists = await prisma.state.findUnique({
      where: { id: stateId }
    });
    
    if (!stateExists) {
      return NextResponse.json({ 
        success: false, 
        error: 'State not found' 
      }, { status: 404 });
    }
    
    // Check if city with same name already exists in the state
    const existingCity = await prisma.city.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        },
        stateId: stateId
      }
    });
    
    if (existingCity) {
      return NextResponse.json({ 
        success: false, 
        error: 'City with this name already exists in the selected state' 
      }, { status: 409 });
    }
    
    const newCity = await prisma.city.create({
      data: {
        name: name.trim(),
        stateId,
        pincode: pincode?.trim() || null,
        active
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
      message: 'City created successfully',
      data: {
        id: newCity.id,
        name: newCity.name,
        stateId: newCity.stateId,
        state: newCity.state,
        pincode: newCity.pincode,
        active: newCity.active,
        createdAt: newCity.createdAt,
        updatedAt: newCity.updatedAt
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating city:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create city' 
    }, { status: 500 });
  }
}

// PUT - Update an existing city
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, stateId, pincode, active } = body;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'City ID is required' 
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
    
    // If stateId is being updated, check if new state exists
    if (stateId && stateId !== existingCity.stateId) {
      const stateExists = await prisma.state.findUnique({
        where: { id: stateId }
      });
      
      if (!stateExists) {
        return NextResponse.json({ 
          success: false, 
          error: 'State not found' 
        }, { status: 404 });
      }
    }
    
    // Check for duplicate city name in the same state (excluding current city)
    if (name && stateId) {
      const duplicateCity = await prisma.city.findFirst({
        where: {
          name: {
            equals: name.trim(),
            mode: 'insensitive'
          },
          stateId: stateId,
          id: {
            not: id
          }
        }
      });
      
      if (duplicateCity) {
        return NextResponse.json({ 
          success: false, 
          error: 'City with this name already exists in the selected state' 
        }, { status: 409 });
      }
    }
    
    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (stateId !== undefined) updateData.stateId = stateId;
    if (pincode !== undefined) updateData.pincode = pincode?.trim() || null;
    if (active !== undefined) updateData.active = active;
    
    const updatedCity = await prisma.city.update({
      where: { id },
      data: updateData,
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
      message: 'City updated successfully',
      data: {
        id: updatedCity.id,
        name: updatedCity.name,
        stateId: updatedCity.stateId,
        state: updatedCity.state,
        pincode: updatedCity.pincode,
        active: updatedCity.active,
        createdAt: updatedCity.createdAt,
        updatedAt: updatedCity.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating city:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update city' 
    }, { status: 500 });
  }
}

// DELETE - Delete a city
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'City ID is required' 
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
    
    // TODO: Add check for related records (e.g., car rentals, bookings)
    // Example:
    // const relatedRecords = await prisma.booking.findFirst({
    //   where: { cityId: id }
    // });
    // 
    // if (relatedRecords) {
    //   return NextResponse.json({ 
    //     success: false, 
    //     error: 'Cannot delete city with existing bookings' 
    //   }, { status: 409 });
    // }
    
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