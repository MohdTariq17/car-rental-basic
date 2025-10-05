
import { prisma } from '../../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../../../util/jwt';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    console.log('Login attempt:', { email, passwordProvided: !!password });
    
    if (!email || !password) {
      return Response.json({ 
        success: false, 
        error: 'Email and password are required' 
      }, { status: 400 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    
    if (!user) {
      console.log('User not found for email:', email);
      return Response.json({ 
        success: false, 
        error: 'Invalid credentials' 
      }, { status: 401 });
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      console.log('Password mismatch for user:', email);
      return Response.json({ 
        success: false, 
        error: 'Invalid credentials' 
      }, { status: 401 });
    }
    
    if (!user.is_active) {
      return Response.json({ 
        success: false, 
        error: 'Account is deactivated' 
      }, { status: 401 });
    }
    
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    
    console.log('Login successful for:', email);
    
    return Response.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ 
      success: false, 
      error: 'Login failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
