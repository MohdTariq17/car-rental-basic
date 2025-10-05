import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch state statistics
export async function GET() {
  try {
    // Get counts for active, inactive, and total states
    const [activeCount, inactiveCount, totalCount] = await Promise.all([
      prisma.state.count({ where: { active: true } }),
      prisma.state.count({ where: { active: false } }),
      prisma.state.count()
    ]);

    // Get additional statistics
    const recentStates = await prisma.state.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        code: true,
        active: true,
        createdAt: true
      }
    });

    // Get states with city counts
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
        counts: {
          active: activeCount,
          inactive: inactiveCount,
          total: totalCount
        },
        recentStates: recentStates,
        statesWithCityCounts: statesWithCities.map(state => ({
          id: state.id,
          name: state.name,
          code: state.code,
          active: state.active,
          cityCount: state._count.cities
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching state statistics:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch state statistics'
    }, { status: 500 });
  }
}

// POST - Get filtered statistics (optional advanced endpoint)
export async function POST(request) {
  try {
    const body = await request.json();
    const { filters = {} } = body;

    let whereClause = {};
    
    // Apply filters if provided
    if (filters.active !== undefined) {
      whereClause.active = filters.active;
    }
    
    if (filters.hasCities !== undefined) {
      if (filters.hasCities) {
        whereClause.cities = {
          some: {}
        };
      } else {
        whereClause.cities = {
          none: {}
        };
      }
    }

    const [filteredCount, totalCount] = await Promise.all([
      prisma.state.count({ where: whereClause }),
      prisma.state.count()
    ]);

    const states = await prisma.state.findMany({
      where: whereClause,
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
        filteredCount,
        totalCount,
        states: states.map(state => ({
          id: state.id,
          name: state.name,
          code: state.code,
          active: state.active,
          cityCount: state._count.cities,
          createdAt: state.createdAt,
          updatedAt: state.updatedAt
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching filtered state statistics:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch filtered state statistics'
    }, { status: 500 });
  }
}