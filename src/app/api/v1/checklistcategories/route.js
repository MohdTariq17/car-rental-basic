import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET - Fetch all categories
export async function GET(request) {
  try {
    const categories = await prisma.checklistCategory.findMany({
      orderBy: {
        name: 'asc'
      },
      include: {
        _count: {
          select: {
            items: true
          }
        }
      }
    });
    
    // Transform the data to include itemsCount
    const formattedCategories = categories.map(category => ({
      ...category,
      itemsCount: category._count.items
    }));
    
    return NextResponse.json({ 
      success: true, 
      data: formattedCategories 
    });
  } catch (error) {
    console.error('Error fetching checklist categories:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch checklist categories' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create new category
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, active = true } = body;
    
    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Category name is required' 
      }, { status: 400 });
    }
    
    if (!description || !description.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Description is required' 
      }, { status: 400 });
    }
    
    // Check if category with same name already exists
    const existingCategory = await prisma.checklistCategory.findFirst({
      where: { 
        name: name.trim() 
      }
    });
    
    if (existingCategory) {
      return NextResponse.json({ 
        success: false, 
        error: 'Category with this name already exists' 
      }, { status: 409 });
    }
    
    // Create new category
    const newCategory = await prisma.checklistCategory.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        active: Boolean(active)
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      data: newCategory,
      message: 'Checklist category created successfully' 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating checklist category:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create checklist category' 
    }, { status: 500 });
  }
}

// PUT - Update existing category
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, description, active } = body;
    
    // Validation
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Category ID is required' 
      }, { status: 400 });
    }
    
    if (!name || !name.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Category name is required' 
      }, { status: 400 });
    }
    
    if (!description || !description.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Description is required' 
      }, { status: 400 });
    }
    
    // Check if category exists
    const existingCategory = await prisma.checklistCategory.findUnique({
      where: { id }
    });
    
    if (!existingCategory) {
      return NextResponse.json({ 
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
      return NextResponse.json({ 
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
    
    return NextResponse.json({ 
      success: true, 
      data: updatedCategory,
      message: 'Checklist category updated successfully' 
    });
    
  } catch (error) {
    console.error('Error updating checklist category:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update checklist category' 
    }, { status: 500 });
  }
}