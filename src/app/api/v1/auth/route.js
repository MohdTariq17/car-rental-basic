
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { generateToken, verifyToken } from '../../../util/jwt';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Handle both action-based and direct requests
    if (body.action) {
      switch (body.action) {
        case 'login':
          return await handleLogin(body);
        case 'register':
          return await handleRegister(body);
        case 'verify':
          return await handleVerifyToken(body);
        default:
          return Response.json({ 
            success: false, 
            error: 'Invalid action' 
          }, { status: 400 });
      }
    } else {
      // Direct login request (backward compatibility)
      return await handleLogin(body);
    }
  } catch (error) {
    console.error('Auth error:', error);
    return Response.json({ 
      success: false, 
      error: 'Authentication failed',
      details: error.message 
    }, { status: 500 });
  }
}

async function handleLogin({ email, password }) {
  console.log('Login attempt for:', email); // Debug log
  
  if (!email || !password) {
    return Response.json({ 
      success: false, 
      error: 'Email and password are required' 
    }, { status: 400 });
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    
    console.log('User found:', user ? 'Yes' : 'No'); // Debug log
    
    if (!user) {
      return Response.json({ 
        success: false, 
        error: 'Invalid credentials' 
      }, { status: 401 });
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', passwordMatch); // Debug log
    
    if (!passwordMatch) {
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
      details: error.message 
    }, { status: 500 });
  }
}

async function handleRegister({ name, email, mobile, username, password, role = 'USER' }) {
  if (!name || !email || !mobile || !username || !password) {
    return Response.json({ 
      success: false, 
      error: 'All fields are required' 
    }, { status: 400 });
  }
  
  try {
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
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        mobile: mobile.trim(),
        username: username.toLowerCase().trim(),
        password: hashedPassword,
        role
      }
    });
    
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    
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
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json({ 
      success: false, 
      error: 'Registration failed',
      details: error.message 
    }, { status: 500 });
  }
}

async function handleVerifyToken({ token }) {
  if (!token) {
    return Response.json({ 
      success: false, 
      error: 'Token is required' 
    }, { status: 400 });
  }
  
  try {
    const payload = await verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true
      }
    });
    
    if (!user || !user.is_active) {
      return Response.json({ 
        success: false, 
        error: 'Invalid or inactive user' 
      }, { status: 401 });
    }
    
    return Response.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: 'Invalid token' 
    }, { status: 401 });
  }
}
