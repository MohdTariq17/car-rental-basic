import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';


// GET /api/v1/brands - Fetch all brands
export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        models: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}

// POST /api/v1/brands - Create new brand
export async function POST(request) {
  try {
    const data = await request.json();
    const brand = await prisma.brand.create({
      data
    });
    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error('Error creating brand:', error);
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
  }
}