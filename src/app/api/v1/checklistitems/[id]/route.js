import { prisma } from '../../../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const item = await prisma.checklistItem.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true
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
    
    return NextResponse.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error fetching checklist item:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch checklist item' 
    }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const { name, categoryId, description, checkType, required, active } = data;
    
    const item = await prisma.checklistItem.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(categoryId && { categoryId }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(checkType && { checkType }),
        ...(required !== undefined && { required }),
        ...(active !== undefined && { active })
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error updating checklist item:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update checklist item' 
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    await prisma.checklistItem.delete({
      where: { id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Checklist item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting checklist item:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete checklist item' 
    }, { status: 500 });
  }
}