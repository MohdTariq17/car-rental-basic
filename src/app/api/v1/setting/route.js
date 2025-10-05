import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const activeParam = searchParams.get('active');
    
    let filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (activeParam !== null) {
      filter.active = activeParam === 'true';
    }
    
    const settings = await prisma.setting.findMany({
      where: filter,
      orderBy: {
        category: 'asc'
      }
    });
    
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { key, value, category, description, dataType, active } = body;
    
    // Validate required fields
    if (!key || !value || !category) {
      return NextResponse.json(
        { success: false, error: 'Key, value, and category are required' },
        { status: 400 }
      );
    }
    
    const setting = await prisma.setting.create({
      data: {
        key,
        value,
        category,
        description: description || '',
        dataType: dataType || 'string',
        active: active !== undefined ? active : true
      }
    });
    
    return NextResponse.json({ success: true, data: setting });
  } catch (error) {
    console.error('Error creating setting:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Setting ID is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { key, value, category, description, dataType, active } = body;
    
    const setting = await prisma.setting.update({
      where: { id: parseInt(id) },
      data: {
        key,
        value,
        category,
        description,
        dataType,
        active
      }
    });
    
    return NextResponse.json({ success: true, data: setting });
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Setting ID is required' },
        { status: 400 }
      );
    }
    
    await prisma.setting.delete({
      where: { id: parseInt(id) }
    });
    
    return NextResponse.json({ success: true, message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Error deleting setting:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}