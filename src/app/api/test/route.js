import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/client';

export async function GET() {
  try {
    const prisma = new PrismaClient();
    
    // Test database connection
    await prisma.$connect();
    
    // Try to count users
    const userCount = await prisma.user.count();
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      message: "Database connection successful",
      userCount,
      timestamp: new Date().toISOString(),
      statusCode: 200
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    
    return NextResponse.json({
      message: "Database connection failed",
      error: error.message,
      timestamp: new Date().toISOString(),
      statusCode: 500
    }, { status: 500 });
  }
}