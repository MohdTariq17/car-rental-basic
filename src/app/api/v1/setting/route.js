
import { prisma } from '../../../../lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    const whereClause = category ? { category } : {};
    
    const settings = await prisma.setting.findMany({
      where: whereClause,
      orderBy: { key: 'asc' }
    });
    
    return Response.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch settings' 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { key, value, category, description, dataType } = data;
    
    if (!key || !value || !category) {
      return Response.json({ 
        success: false, 
        error: 'Key, value, and category are required' 
      }, { status: 400 });
    }
    
    const setting = await prisma.setting.create({
      data: {
        key: key.trim(),
        value: value.trim(),
        category: category.trim(),
        description: description?.trim(),
        dataType: dataType || 'string'
      }
    });
    
    return Response.json({ 
      success: true, 
      data: setting 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating setting:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to create setting' 
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, key, value, category, description, dataType, active } = data;
    
    if (!id) {
      return Response.json({ 
        success: false, 
        error: 'Setting ID is required' 
      }, { status: 400 });
    }
    
    const setting = await prisma.setting.update({
      where: { id },
      data: {
        key: key?.trim(),
        value: value?.trim(),
        category: category?.trim(),
        description: description?.trim(),
        dataType: dataType,
        active: active !== undefined ? Boolean(active) : undefined
      }
    });
    
    return Response.json({ 
      success: true, 
      data: setting 
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to update setting' 
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return Response.json({ 
        success: false, 
        error: 'Setting ID is required' 
      }, { status: 400 });
    }
    
    await prisma.setting.delete({
      where: { id }
    });
    
    return Response.json({ 
      success: true, 
      message: 'Setting deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting setting:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to delete setting' 
    }, { status: 500 });
  }
}
