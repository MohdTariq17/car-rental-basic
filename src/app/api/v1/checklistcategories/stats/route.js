import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get category counts
    const totalCategories = await prisma.checklistCategory.count();
    const activeCategories = await prisma.checklistCategory.count({
      where: { active: true }
    });
    const inactiveCategories = totalCategories - activeCategories;
    
    // Get total items across all categories
    const totalItems = await prisma.checklistItem.count();
    const activeItems = await prisma.checklistItem.count({
      where: { active: true }
    });
    
    // Get categories with item counts
    const categoriesWithItems = await prisma.checklistCategory.findMany({
      include: {
        _count: {
          select: {
            items: true
          }
        }
      }
    });
    
    const categoryStats = categoriesWithItems.map(category => ({
      id: category.id,
      name: category.name,
      itemCount: category._count.items,
      active: category.active
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        counts: {
          total: totalCategories,
          active: activeCategories,
          inactive: inactiveCategories
        },
        items: {
          total: totalItems,
          active: activeItems,
          inactive: totalItems - activeItems
        },
        categoryBreakdown: categoryStats
      }
    });
    
  } catch (error) {
    console.error('Error fetching checklist category stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch statistics'
    }, { status: 500 });
  }
}