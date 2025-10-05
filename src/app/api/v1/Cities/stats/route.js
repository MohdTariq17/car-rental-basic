import { prisma } from '../../../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [totalCount, activeCount] = await Promise.all([
      prisma.city.count(),
      prisma.city.count({
        where: { active: true }
      })
    ]);
    
    const inactiveCount = totalCount - activeCount;
    
    const citiesByState = await prisma.city.groupBy({
      by: ['stateId'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        total: totalCount,
        active: activeCount,
        inactive: inactiveCount,
        citiesByState
      }
    });
  } catch (error) {
    console.error('Error fetching city stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch city statistics'
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { filters = {} } = body;

    let whereClause = {};
    
    // Apply filters if provided
    if (filters.active !== undefined) {
      whereClause.active = filters.active;
    }
    
    if (filters.stateId) {
      whereClause.stateId = filters.stateId;
    }
    
    if (filters.hasState !== undefined) {
      if (filters.hasState) {
        whereClause.state = {
          isNot: null
        };
      }
    }

    const [filteredCount, totalCount, activeCount, inactiveCount] = await Promise.all([
      prisma.city.count({ where: whereClause }),
      prisma.city.count(),
      prisma.city.count({ where: { active: true } }),
      prisma.city.count({ where: { active: false } })
    ]);

    const cities = await prisma.city.findMany({
      where: whereClause,
      include: {
        state: {
          select: {
            id: true,
            name: true,
            code: true,
            active: true
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
        filteredCount,
        totalCount,
        activeCount,
        inactiveCount,
        cities: cities.map(city => ({
          id: city.id,
          name: city.name,
          stateId: city.stateId,
          state: city.state,
          pincode: city.pincode,
          active: city.active,
          createdAt: city.createdAt,
          updatedAt: city.updatedAt
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching filtered city statistics:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch filtered city statistics'
    }, { status: 500 });
  }
}
