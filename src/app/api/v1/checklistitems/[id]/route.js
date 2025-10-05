
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch single checklist item
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Item ID is required' 
      }, { status: 400 });
    }
    
    const item = await prisma.checklistItem.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            active: true
          }
        }
      }
    });
    
    if (!item) {
      return NextResponse.json({ 
        success: false, 
        error: 'Checklist item not found' 
      }, { status: 404 });
    }
    
    // Parse options for response
    const formattedItem = {
      ...item,
      options: item.options ? JSON.parse(item.options) : null
    };
    
    return NextResponse.json({ 
      success: true, 
      data: formattedItem 
    });
  } catch (error) {
    console.error('Error fetching checklist item:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch checklist item' 
    }, { status: 500 });
  }
}

// PUT - Update single checklist item
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { 
      name, 
      categoryId, 
      description, 
      checkType, 
      required, 
      active,
      options
    } = body;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Item ID is required' 
      }, { status: 400 });
    }
    
    // Check if item exists
    const existingItem = await prisma.checklistItem.findUnique({
      where: { id }
    });
    
    if (!existingItem) {
      return NextResponse.json({ 
        success: false, 
        error: 'Checklist item not found' 
      }, { status: 404 });
    }
    
    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (checkType !== undefined) updateData.checkType = checkType;
    if (required !== undefined) updateData.required = Boolean(required);
    if (active !== undefined) updateData.active = Boolean(active);
    if (options !== undefined) updateData.options = options ? JSON.stringify(options) : null;
    
    // Update checklist item
    const updatedItem = await prisma.checklistItem.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            active: true
          }
        }
      }
    });
    
    // Parse options for response
    const formattedItem = {
      ...updatedItem,
      options: updatedItem.options ? JSON.parse(updatedItem.options) : null
    };
    
    return NextResponse.json({ 
      success: true, 
      data: formattedItem,
      message: 'Checklist item updated successfully' 
    });
    
  } catch (error) {
    console.error('Error updating checklist item:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update checklist item' 
    }, { status: 500 });
  }
}

// DELETE - Delete single checklist item
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Item ID is required' 
      }, { status: 400 });
    }
    
    // Check if item exists
    const existingItem = await prisma.checklistItem.findUnique({
      where: { id }
    });
    
    if (!existingItem) {
      return NextResponse.json({ 
        success: false, 
        error: 'Checklist item not found' 
      }, { status: 404 });
    }
    
    // Delete the item
    await prisma.checklistItem.delete({
      where: { id }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `Checklist item "${existingItem.name}" deleted successfully` 
    });
    
  } catch (error) {
    console.error('Error deleting checklist item:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete checklist item' 
    }, { status: 500 });
  }
}