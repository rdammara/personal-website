'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const MIN_LENGTH = 12;

type Status = { kind: 'idle' } | { kind: 'saving' } | { kind: 'done' } | { kind: 'error'; message: string };

export function PasswordForm() {
  const router = useRouter();
  const [current, setCurrent] = React.useState('');
  const [next, setNext] = React.useState('');
  const [repeat, setRepeat] = React.useState('');
  const [status, setStatus] = React.useState<Status>({ kind: 'idle' });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    // Checked here for a quick answer; the server checks again
    if (next.length < MIN_LENGTH) return setStatus({ kind: 'error', message: `Use at least ${MIN_LENGTH} characters.` });
    if (next !== repeat) return setStatus({ kind: 'error', message: 'The two new passwords do not match.' });

    setStatus({ kind: 'saving' });
    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setStatus({ kind: 'error', message: data.error ?? `Not saved (status ${res.status}).` });
      setCurrent('');
      setNext('');
      setRepeat('');
      setStatus({ kind: 'done' });
      router.refresh();
    } catch {
      setStatus({ kind: 'error', message: 'The request did not reach the server. Check your connection and try again.' });
    }
  };

  return (
    <form onSubmit={save} className="space-y-4">
      <div>
        <label htmlFor="current-password" className="mb-1.5 block text-sm font-semibold">
          Current password
        </label>
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          required
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="new-password" className="mb-1.5 block text-sm font-semibold">
          New password
        </label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_LENGTH}
          aria-describedby="new-password-hint"
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
        <p id="new-password-hint" className="mb-0 mt-1.5 text-sm text-muted">
          At least {MIN_LENGTH} characters.
        </p>
      </div>
      <div>
        <label htmlFor="repeat-password" className="mb-1.5 block text-sm font-semibold">
          New password again
        </label>
        <Input
          id="repeat-password"
          type="password"
          autoComplete="new-password"
          required
          value={repeat}
          onChange={(e) => setRepeat(e.target.value)}
        />
      </div>

      <p role="status" aria-live="polite" className="min-h-5 text-sm">
        {status.kind === 'done' && (
          <span className="text-emerald-700 dark:text-emerald-400">
            Password changed. Other browsers have been signed out; this one stays signed in.
          </span>
        )}
        {status.kind === 'error' && <span className="text-red-700 dark:text-red-400">{status.message}</span>}
      </p>

      <Button type="submit" disabled={status.kind === 'saving'}>
        {status.kind === 'saving' ? 'Saving…' : 'Change password'}
      </Button>
    </form>
  );
}
