import {NextResponse} from'next/server';
import bcrypt from'bcryptjs';

import {PrismaClient} from'../../../../../generated/prisma-client';

//generate api curd routes for users as per prisma users model
//npm i bcryptjs
//postapi

const prisma = new PrismaClient();

export async function POST(request) {
  const { email, password } = await request.json();

  // Validate input
  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required", statusCode: 400 },
      { status: 400 }
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  return NextResponse.json(
    { message: "User created successfully", user },
    { status: 201 }
  );
}
