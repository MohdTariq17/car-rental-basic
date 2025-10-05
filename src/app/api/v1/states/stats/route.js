import { prisma } from '../../../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [totalCount, activeCount] = await Promise.all([
      prisma.state.count(),
      prisma.state.count({
        where: { active: true }
      })
    ]);
    
    const inactiveCount = totalCount - activeCount;
    
    const statesWithCities = await prisma.state.findMany({
      include: {
        _count: {
          select: {
            cities: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        total: totalCount,
        active: activeCount,
        inactive: inactiveCount,
        statesWithCities: statesWithCities.map(state => ({
          id: state.id,
          name: state.name,
          code: state.code,
          active: state.active,
          cityCount: state._count.cities
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching state stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch state statistics'
    }, { status: 500 });
  }
}
