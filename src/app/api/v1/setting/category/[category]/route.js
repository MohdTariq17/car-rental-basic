
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { category } = params;
    
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category is required' }, { status: 400 });
    }
    
    const { searchParams } = new URL(request.url);
    const activeParam = searchParams.get('active');
    
    let filter = { category };
    
    if (activeParam !== null) {
      filter.active = activeParam === 'true';
    }
    
    const settings = await prisma.setting.findMany({
      where: filter,
      orderBy: {
        key: 'asc'
      }
    });
    
    // Convert to key-value object for easier consumption
    const settingsObject = {};
    settings.forEach(setting => {
      // Convert value based on dataType
      let parsedValue = setting.value;
      if (setting.dataType === 'number') {
        parsedValue = Number(setting.value);
      } else if (setting.dataType === 'boolean') {
        parsedValue = setting.value.toLowerCase() === 'true';
      }
      
      settingsObject[setting.key] = {
        value: parsedValue,
        description: setting.description,
        dataType: setting.dataType,
        active: setting.active
      };
    });
    
    return NextResponse.json({ 
      success: true, 
      category,
      data: settingsObject,
      rawSettings: settings
    });
  } catch (error) {
    console.error(`Error fetching settings for category ${params.category}:`, error);
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}