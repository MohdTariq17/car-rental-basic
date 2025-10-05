
import { prisma } from '../../../../lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Handle both parameter formats
    let page, limit, skip;
    
    // Check if using skip/limit format (from your frontend)
    if (searchParams.has('skip')) {
      skip = parseInt(searchParams.get('skip')) || 0;
      limit = parseInt(searchParams.get('limit')) || 10;
      page = Math.floor(skip / limit) + 1;
    } else {
      // Use page/limit format
      page = parseInt(searchParams.get('page')) || 1;
      limit = parseInt(searchParams.get('limit')) || 10;
      skip = (page - 1) * limit;
    }
    
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const sortField = searchParams.get('sortField') || 'created_at';
    const sortOrder = parseInt(searchParams.get('sortOrder')) || -1;
    
    // Build where clause
    const whereClause = {
      AND: [
        role ? { role } : {},
        search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { username: { contains: search, mode: 'insensitive' } }
          ]
        } : {}
      ]
    };
    
    // Build order by clause
    const orderByField = sortField === 'createdAt' ? 'created_at' : sortField;
    const orderBy = { [orderByField]: sortOrder === -1 ? 'desc' : 'asc' };
    
    console.log('Query params:', { skip, limit, page, whereClause, orderBy });
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
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
        },
        skip,
        take: limit,
        orderBy
      }),
      prisma.user.count({ where: whereClause })
    ]);
    
    console.log(`Found ${users.length} users out of ${total} total`);
    
    // Return in format expected by frontend
    return Response.json({
      success: true,
      users: users,
      totalCount: total,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch users',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, email, mobile, username, password, role = 'USER' } = data;
    
    if (!name || !email || !mobile || !username || !password) {
      return Response.json({ 
        success: false, 
        error: 'All fields are required' 
      }, { status: 400 });
    }
    
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase().trim() },
          { mobile: mobile.trim() },
          { username: username.toLowerCase().trim() }
        ]
      }
    });
    
    if (existingUser) {
      return Response.json({ 
        success: false, 
        error: 'User already exists with this email, mobile, or username' 
      }, { status: 409 });
    }
    
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        mobile: mobile.trim(),
        username: username.toLowerCase().trim(),
        password: hashedPassword,
        role
      },
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
    
    return Response.json({
      success: true,
      data: user
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to create user',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
