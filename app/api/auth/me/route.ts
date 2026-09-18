import { NextResponse } from 'next/server';
import { getSessionUser, COOKIE_NAME } from '@/lib/auth';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null, authenticated: false });
  }
  return NextResponse.json({ user, authenticated: true });
}

export async function POST() {
  // Logout
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return response;
}
