import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PasswordForm } from './PasswordForm';

export const dynamic = 'force-dynamic';

const formatWhen = (d: Date) =>
  new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(d) + ' UTC';

export default async function AccountPage() {
  const session = await getSessionUser();
  const user = session
    ? await prisma.user.findUnique({ where: { id: session.id }, select: { email: true, passwordChangedAt: true } })
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="m-0 text-2xl font-bold tracking-[-0.02em] sm:text-3xl">Account</h1>
        <p className="mb-0 mt-1 text-[15px] text-muted">Signed in as {user?.email}</p>
      </div>

      <section className="rounded-xl border border-line bg-bg p-6 max-sm:p-5">
        <h2 className="m-0 text-lg font-bold">Change password</h2>
        <p className="mb-0 mt-1 text-sm text-muted">
          {user?.passwordChangedAt ? `Last changed ${formatWhen(user.passwordChangedAt)}. ` : ''}
          Changing it signs out every other browser where you are signed in.
        </p>
        <div className="mt-6 max-w-md">
          <PasswordForm />
        </div>
      </section>
    </div>
  );
}
