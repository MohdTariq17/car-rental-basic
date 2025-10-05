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

// Add signToken as an alias for generateToken for consistency
export const signToken = generateToken;

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
    // Remove the exp, iat claims and create a new token
    const { exp, iat, ...userPayload } = payload;
    return await generateToken(userPayload);
  } catch (error) {
    throw new Error('Invalid token for refresh');
  }
}

export function decodeTokenWithoutVerification(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf8')
    );
    return payload;
  } catch (error) {
    throw new Error('Failed to decode token');
  }
}
