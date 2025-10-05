import { prisma } from '../../../../../lib/prisma';

export async function GET(request, { params }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        username: true,
        role: true,
        is_active: true,
        email_verified: true,
        mobile_verified: true,
        created_at: true,
        updated_at: true
      }
    });
    
    if (!user) {
      return Response.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    return Response.json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch user' 
    }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json();
    const { name, email, mobile, username, role, is_active } = data;
    
    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        name: name?.trim(),
        email: email?.toLowerCase().trim(),
        mobile: mobile?.trim(),
        username: username?.toLowerCase().trim(),
        role,
        is_active: is_active !== undefined ? Boolean(is_active) : undefined
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        username: true,
        role: true,
        is_active: true,
        updated_at: true
      }
    });
    
    return Response.json({ 
      success: true, 
      data: user 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json({
      success: false,
      error: 'Failed to update user'
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.user.delete({
      where: { id: params.id }
    });

    return Response.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to delete user' 
    }, { status: 500 });
  }
}
