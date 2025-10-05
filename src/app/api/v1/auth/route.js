import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create JWT token
    const token = await new SignJWT({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return Response.json({
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Auth error:', error);
    return Response.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
