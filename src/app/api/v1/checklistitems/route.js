import { prisma } from '../../../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const active = searchParams.get('active');
    
    let whereClause = {};
    
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    
    if (active !== null && active !== undefined) {
      whereClause.active = active === 'true';
    }

    const items = await prisma.checklistItem.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            active: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Parse options field if it exists
    const formattedItems = items.map(item => ({
      ...item,
      options: item.options ? JSON.parse(item.options) : null
    }));

    return NextResponse.json({ 
      success: true, 
      data: formattedItems,
      message: 'Checklist items fetched successfully' 
    });
    
  } catch (error) {
    console.error('Error fetching checklist items:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch checklist items' 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      name, 
      categoryId, 
      description, 
      checkType = 'BOOLEAN', 
      required = false, 
      active = true,
      options = null
    } = body;
    
    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Item name is required' 
      }, { status: 400 });
    }
    
    if (!categoryId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Category ID is required' 
      }, { status: 400 });
    }
    
    // Verify category exists and is active
    const category = await prisma.checklistCategory.findUnique({
      where: { id: categoryId }
    });
    
    if (!category) {
      return NextResponse.json({ 
        success: false, 
        error: 'Category not found' 
      }, { status: 404 });
    }
    
    if (!category.active) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot add items to inactive category' 
      }, { status: 400 });
    }
    
    // Check if item with same name exists in the same category
    const existingItem = await prisma.checklistItem.findFirst({
      where: { 
        name: name.trim(),
        categoryId: categoryId
      }
    });
    
    if (existingItem) {
      return NextResponse.json({ 
        success: false, 
        error: 'Item with this name already exists in this category' 
      }, { status: 409 });
    }
    
    // Validate checkType
    const validCheckTypes = ['BOOLEAN', 'TEXT', 'NUMBER', 'DROPDOWN', 'RATING'];
    if (!validCheckTypes.includes(checkType)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid check type. Must be one of: ' + validCheckTypes.join(', ') 
      }, { status: 400 });
    }
    
    // Validate options for dropdown type
    if (checkType === 'DROPDOWN' && (!options || !Array.isArray(options) || options.length === 0)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Options are required for dropdown type items' 
      }, { status: 400 });
    }
    
    // Create new checklist item
    const newItem = await prisma.checklistItem.create({
      data: {
        name: name.trim(),
        categoryId,
        description: description?.trim() || null,
        checkType,
        required: Boolean(required),
        active: Boolean(active),
        options: options ? JSON.stringify(options) : null
      },
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
      ...newItem,
      options: newItem.options ? JSON.parse(newItem.options) : null
    };
    
    return NextResponse.json({ 
      success: true, 
      data: formattedItem,
      message: 'Checklist item created successfully' 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating checklist item:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create checklist item' 
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { 
      id, 
      name, 
      categoryId, 
      description, 
      checkType, 
      required, 
      active,
      options
    } = body;
    
    // Validation
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Item ID is required' 
      }, { status: 400 });
    }
    
    if (name && !name.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Item name cannot be empty' 
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
    
    // Verify category exists if categoryId is provided
    if (categoryId) {
      const category = await prisma.checklistCategory.findUnique({
        where: { id: categoryId }
      });
      
      if (!category) {
        return NextResponse.json({ 
          success: false, 
          error: 'Category not found' 
        }, { status: 404 });
      }
    }
    
    // Check if name is taken by another item in the same category
    if (name) {
      const nameConflict = await prisma.checklistItem.findFirst({
        where: { 
          name: name.trim(),
          categoryId: categoryId || existingItem.categoryId,
          id: { not: id }
        }
      });
      
      if (nameConflict) {
        return NextResponse.json({ 
          success: false, 
          error: 'Item with this name already exists in this category' 
        }, { status: 409 });
      }
    }
    
    // Validate checkType if provided
    if (checkType) {
      const validCheckTypes = ['BOOLEAN', 'TEXT', 'NUMBER', 'DROPDOWN', 'RATING'];
      if (!validCheckTypes.includes(checkType)) {
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid check type. Must be one of: ' + validCheckTypes.join(', ') 
        }, { status: 400 });
      }
    }
    
    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (categoryId) updateData.categoryId = categoryId;
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (checkType) updateData.checkType = checkType;
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

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Item ID is required' 
      }, { status: 400 });
    }
    
    // Check if item exists
    const existingItem = await prisma.checklistItem.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            name: true
          }
        }
      }
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