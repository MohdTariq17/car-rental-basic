import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

export async function GET() {
  try {
    const [totalCount, activeCount, inactiveCount] = await Promise.all([
      prisma.city.count(),
      prisma.city.count({ where: { active: true } }),
      prisma.city.count({ where: { active: false } })
    ]);

    // Get cities grouped by state
    const citiesByState = await prisma.state.findMany({
      include: {
        _count: {
          select: {
            cities: true
          }
        },
        cities: {
          select: {
            id: true,
            name: true,
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
        totalCount,
        activeCount,
        inactiveCount,
        citiesByState: citiesByState.map(state => ({
          stateId: state.id,
          stateName: state.name,
          stateCode: state.code,
          stateActive: state.active,
          cityCount: state._count.cities,
          cities: state.cities
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching city statistics:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch city statistics'
    }, { status: 500 });
  }
}