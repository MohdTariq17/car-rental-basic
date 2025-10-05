import { prisma } from '../../../../../../lib/prisma';

export async function GET() {
  try {
    const [totalCategories, activeCategories, totalItems] = await Promise.all([
      prisma.checklistCategory.count(),
      prisma.checklistCategory.count({
        where: { is_active: true }
      }),
      prisma.checklistItem.count()
    ]);
    
    const categoriesWithItemCount = await prisma.checklistCategory.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            items: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    return Response.json({
      success: true,
      data: {
        totalCategories,
        activeCategories,
        totalItems,
        categoriesWithItemCount
      }
    });
  } catch (error) {
    console.error('Error fetching checklist categories stats:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch stats' 
    }, { status: 500 });
  }
}
