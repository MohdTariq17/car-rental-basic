import { NextResponse } from 'next/server';
import { UserService } from '../../../../services/userService.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const take = parseInt(searchParams.get('limit') || '10');
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = parseInt(searchParams.get('sortOrder') || '-1');
    const filters = JSON.parse(searchParams.get('filters') || '{}');

    const result = await UserService.getUsers({
      skip,
      take,
      sortField,
      sortOrder,
      filters,
    });

    return NextResponse.json({
      success: true,
      users: result.users,
      totalCount: result.totalCount,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const user = await UserService.createUser(body);

    return NextResponse.json({
      success: true,
      user,
      message: 'User created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}