import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// GET - Fetch all cities
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const stateId = searchParams.get('stateId');

    const skip = (page - 1) * limit;
    
    let whereClause = {};
    
    if (search) {
      whereClause.name = {
        contains: search,
        mode: 'insensitive'
      };
    }
    
    if (status !== null && status !== undefined && status !== '') {
      whereClause.active = status === 'Active' || status === 'true';
    }
    
    if (stateId) {
      whereClause.stateId = stateId;
    }

    const [cities, totalCount] = await Promise.all([
      prisma.city.findMany({
        where: whereClause,
        include: {
          state: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          name: 'asc'
        }
      }),
      prisma.city.count({ where: whereClause })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        cities: cities.map(city => ({
          id: city.id,
          name: city.name,
          code: city.code,
          state: city.state?.name || 'Unknown',
          stateId: city.stateId,
          status: city.active ? 'Active' : 'Inactive',
          active: city.active,
          createdAt: city.createdAt,
          updatedAt: city.updatedAt
        })),
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch cities'
    }, { status: 500 });
  }
}

// POST - Create a new city
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, stateId, code, active = true } = body;

    if (!name || !stateId || !code) {
      return NextResponse.json({
        success: false,
        error: 'Name, state, and code are required'
      }, { status: 400 });
    }

    // Check if city already exists in the same state or code already exists
    const existingCity = await prisma.city.findFirst({
      where: {
        OR: [
          {
            name: {
              equals: name,
              mode: 'insensitive'
            },
            stateId: stateId
          },
          {
            code: {
              equals: code,
              mode: 'insensitive'
            }
          }
        ]
      }
    });

    if (existingCity) {
      if (existingCity.code.toLowerCase() === code.toLowerCase()) {
        return NextResponse.json({
          success: false,
          error: 'City code already exists'
        }, { status: 409 });
      } else {
        return NextResponse.json({
          success: false,
          error: 'City already exists in this state'
        }, { status: 409 });
      }
    }

    const city = await prisma.city.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        stateId,
        active
      },
      include: {
        state: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: city.id,
        name: city.name,
        code: city.code,
        state: city.state?.name || 'Unknown',
        stateId: city.stateId,
        status: city.active ? 'Active' : 'Inactive',
        active: city.active,
        createdAt: city.createdAt,
        updatedAt: city.updatedAt
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating city:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'City code must be unique'
      }, { status: 409 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create city'
    }, { status: 500 });
  }
}