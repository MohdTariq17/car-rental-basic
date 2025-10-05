import { prisma } from '../../../../lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    const where = category ? { category, active: true } : { active: true };
    
    const settings = await prisma.setting.findMany({
      where,
      orderBy: { key: 'asc' }
    });
    
    return Response.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return Response.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    const setting = await prisma.setting.create({
      data
    });
    
    return Response.json(setting, { status: 201 });
  } catch (error) {
    console.error('Error creating setting:', error);
    return Response.json({ error: 'Failed to create setting' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    
    const setting = await prisma.setting.update({
      where: { id },
      data: updateData
    });
    
    return Response.json(setting);
  } catch (error) {
    console.error('Error updating setting:', error);
    return Response.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return Response.json({ error: 'Setting ID is required' }, { status: 400 });
    }
    
    await prisma.setting.delete({
      where: { id }
    });
    
    return Response.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Error deleting setting:', error);
    return Response.json({ error: 'Failed to delete setting' }, { status: 500 });
  }
}
