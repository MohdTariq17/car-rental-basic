import { SignJWT, jwtVerify } from 'jose';


const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-here-make-it-long-and-secure'
);

export async function generateToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function refreshToken(token) {
  try {
    const payload = await verifyToken(token);
    // Remove JWT specific claims before creating new token
    const { iat, exp, ...userPayload } = payload;
    return await generateToken(userPayload);
  } catch (error) {
    throw new Error('Cannot refresh invalid token');
  }
}

export function decodeTokenWithoutVerification(token) {
  try {
    // Split the token and decode the payload
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString()
    );
    
    return payload;
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
}