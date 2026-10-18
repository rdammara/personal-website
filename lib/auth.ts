import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from './prisma';

export const COOKIE_NAME = 'auth_session';

// Read at call time with no fallback: a default secret would let anyone forge an admin session.
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return secret;
}

export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number; // Seconds; added by jsonwebtoken when signing
}

export const MIN_PASSWORD_LENGTH = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, createdAt: true, passwordChangedAt: true },
    });
    if (!user) return null;
    // A password change signs out every session issued before it
    if (user.passwordChangedAt && (payload.iat ?? 0) < Math.floor(user.passwordChangedAt.getTime() / 1000)) {
      return null;
    }
    return { id: user.id, email: user.email, createdAt: user.createdAt };
  } catch (error) {
    console.error('Error fetching session user:', error);
    return null;
  }
}

// Session cookie settings shared by sign-in and password change.
// HTTPS-only when the visit is HTTPS (nginx passes X-Forwarded-Proto); a secure
// cookie sent over plain HTTP would be dropped and sign-in would silently fail.
export function setSessionCookie(req: NextRequest, response: NextResponse, token: string) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: req.headers.get('x-forwarded-proto') === 'https' || req.nextUrl.protocol === 'https:',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days, matching the token
  });
}

// For API routes that change data: answer 401 unless an admin is signed in
export function unauthorized() {
  return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
}
