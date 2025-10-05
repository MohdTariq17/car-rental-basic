import { prisma } from '../../../../../../lib/prisma';

export async function GET(request, { params }) {
  try {
    const { category } = params;
    
    const settings = await prisma.setting.findMany({
      where: { category },
      orderBy: { key: 'asc' }
    });
    
    return Response.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch settings' 
    }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { category } = params;
    const data = await request.json();
    const { key, value, description } = data;
    
    if (!key || value === undefined) {
      return Response.json({ 
        success: false, 
        error: 'Key and value are required' 
      }, { status: 400 });
    }
    
    const setting = await prisma.setting.upsert({
      where: {
        category_key: {
          category,
          key
        }
      },
      update: {
        value,
        description: description || null
      },
      create: {
        category,
        key,
        value,
        description: description || null
      }
    });
    
    return Response.json({
      success: true,
      data: setting
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating setting:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to create/update setting' 
    }, { status: 500 });
  }
}