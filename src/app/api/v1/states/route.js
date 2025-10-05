import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search');
    
    const skip = (page - 1) * limit;
    
    const whereClause = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } }
      ]
    } : {};
    
    const [states, total] = await Promise.all([
      prisma.state.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              cities: true
            }
          }
        }
      }),
      prisma.state.count({ where: whereClause })
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        states,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching states:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch states' 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, code } = data;
    
    if (!name || !code) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name and code are required' 
      }, { status: 400 });
    }
    
    const state = await prisma.state.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase()
      }
    });
    
    return NextResponse.json({
      success: true,
      data: state
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating state:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create state' 
    }, { status: 500 });
  }
}

// PUT - Update an existing state
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, code, active } = body;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'State ID is required' 
      }, { status: 400 });
    }

    // Check if state exists (using string ID for MongoDB)
    const existingState = await prisma.state.findUnique({
      where: { id: id }
    });

    if (!existingState) {
      return NextResponse.json({ 
        success: false, 
        error: 'State not found' 
      }, { status: 404 });
    }

    // Check if code is being changed and if new code already exists
    if (code && code.toUpperCase() !== existingState.code) {
      const codeExists = await prisma.state.findUnique({
        where: { code: code.toUpperCase() }
      });

      if (codeExists) {
        return NextResponse.json({ 
          success: false, 
          error: 'State with this code already exists' 
        }, { status: 409 });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (code !== undefined) updateData.code = code.toUpperCase().trim();
    if (active !== undefined) updateData.active = active;

    const updatedState = await prisma.state.update({
      where: { id: id },
      data: updateData
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'State updated successfully',
      data: updatedState 
    });
  } catch (error) {
    console.error('Error updating state:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update state' 
    }, { status: 500 });
  }
}

// DELETE - Delete a state
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'State ID is required' 
      }, { status: 400 });
    }

    // Check if state exists (using string ID for MongoDB)
    const existingState = await prisma.state.findUnique({
      where: { id: id }
    });

    if (!existingState) {
      return NextResponse.json({ 
        success: false, 
        error: 'State not found' 
      }, { status: 404 });
    }

    // Check if state has associated cities
    const citiesCount = await prisma.city.count({
      where: { stateId: id }
    });

    if (citiesCount > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot delete state with associated cities' 
      }, { status: 409 });
    }

    await prisma.state.delete({
      where: { id: id }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'State deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting state:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete state' 
    }, { status: 500 });
  }
}
