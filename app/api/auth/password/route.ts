import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getSessionUser,
  hashPassword,
  MIN_PASSWORD_LENGTH,
  setSessionCookie,
  signToken,
  unauthorized,
  verifyPassword,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) return unauthorized();

  let body: { currentPassword?: unknown; newPassword?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Send the current and new password.' }, { status: 400 });
  }
  const current = typeof body.currentPassword === 'string' ? body.currentPassword : '';
  const next = typeof body.newPassword === 'string' ? body.newPassword : '';

  if (next.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json({ error: `Use at least ${MIN_PASSWORD_LENGTH} characters.` }, { status: 400 });
  }
  if (next.length > 200) {
    return NextResponse.json({ error: 'That password is too long.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user || !(await verifyPassword(current, user.passwordHash))) {
    return NextResponse.json({ error: 'The current password is not correct.' }, { status: 400 });
  }
  if (await verifyPassword(next, user.passwordHash)) {
    return NextResponse.json({ error: 'The new password is the same as the current one.' }, { status: 400 });
  }

  // Whole seconds, like token timestamps, so the new session issued below in this same
  // second still counts as issued after the change
  const changedAt = new Date(Math.floor(Date.now() / 1000) * 1000);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(next), passwordChangedAt: changedAt },
  });

  // Other devices are signed out by passwordChangedAt; this browser gets a fresh session
  const response = NextResponse.json({ success: true });
  setSessionCookie(req, response, signToken({ userId: user.id, email: user.email }));
  return response;
}
