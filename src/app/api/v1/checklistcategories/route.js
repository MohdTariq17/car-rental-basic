import { prisma } from '../../../../lib/prisma';

// GET - Fetch all checklist categories
export async function GET(request) {
  try {
    const categories = await prisma.checklistCategory.findMany({
      include: {
        items: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    return Response.json(categories);
  } catch (error) {
    console.error('Error fetching checklist categories:', error);
    return Response.json({ error: 'Failed to fetch checklist categories' }, { status: 500 });
  }
}

// POST - Create new checklist category
export async function POST(request) {
  try {
    const data = await request.json();
    const category = await prisma.checklistCategory.create({
      data
    });
    return Response.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating checklist category:', error);
    return Response.json({ error: 'Failed to create checklist category' }, { status: 500 });
  }
}

// PUT - Update existing category
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, description, active } = body;
    
    // Validation
    if (!id) {
      return Response.json({ 
        success: false, 
        error: 'Category ID is required' 
      }, { status: 400 });
    }
    
    if (!name || !name.trim()) {
      return Response.json({ 
        success: false, 
        error: 'Category name is required' 
      }, { status: 400 });
    }
    
    if (!description || !description.trim()) {
      return Response.json({ 
        success: false, 
        error: 'Description is required' 
      }, { status: 400 });
    }
    
    // Check if category exists
    const existingCategory = await prisma.checklistCategory.findUnique({
      where: { id }
    });
    
    if (!existingCategory) {
      return Response.json({ 
        success: false, 
        error: 'Category not found' 
      }, { status: 404 });
    }
    
    // Check if name is taken by another category
    const nameConflict = await prisma.checklistCategory.findFirst({
      where: { 
        name: name.trim(),
        id: { not: id }
      }
    });
    
    if (nameConflict) {
      return Response.json({ 
        success: false, 
        error: 'Category with this name already exists' 
      }, { status: 409 });
    }
    
    // Update category
    const updatedCategory = await prisma.checklistCategory.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description.trim(),
        active: Boolean(active)
      }
    });
    
    return Response.json({ 
      success: true, 
      data: updatedCategory,
      message: 'Checklist category updated successfully' 
    });
    
  } catch (error) {
    console.error('Error updating checklist category:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to update checklist category' 
    }, { status: 500 });
  }
}

// DELETE - Delete checklist category
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return Response.json({ 
        success: false, 
        error: 'Category ID is required' 
      }, { status: 400 });
    }
    
    // Check if category exists
    const existingCategory = await prisma.checklistCategory.findUnique({
      where: { id },
      include: {
        items: true
      }
    });
    
    if (!existingCategory) {
      return Response.json({ 
        success: false, 
        error: 'Category not found' 
      }, { status: 404 });
    }
    
    // Check if category has items
    if (existingCategory.items && existingCategory.items.length > 0) {
      return Response.json({ 
        success: false, 
        error: 'Cannot delete category with existing items' 
      }, { status: 409 });
    }
    
    // Delete category
    await prisma.checklistCategory.delete({
      where: { id }
    });
    
    return Response.json({ 
      success: true, 
      message: 'Checklist category deleted successfully' 
    });
    
  } catch (error) {
    console.error('Error deleting checklist category:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to delete checklist category' 
    }, { status: 500 });
  }
}
