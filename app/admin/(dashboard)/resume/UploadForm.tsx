'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

type Status = { kind: 'idle' } | { kind: 'uploading' } | { kind: 'done'; message: string } | { kind: 'error'; message: string };

export function UploadForm() {
  const router = useRouter();
  const [status, setStatus] = React.useState<Status>({ kind: 'idle' });
  const inputRef = React.useRef<HTMLInputElement>(null);

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setStatus({ kind: 'error', message: 'Choose a PDF file first.' });
      return;
    }
    setStatus({ kind: 'uploading' });
    const body = new FormData();
    body.append('file', file);
    try {
      const res = await fetch('/api/resume', { method: 'POST', body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus({ kind: 'error', message: data.error ?? `Upload failed (status ${res.status}).` });
        return;
      }
      setStatus({
        kind: 'done',
        message: `Uploaded. ${data.pages} page${data.pages === 1 ? '' : 's'}, ${data.textLength.toLocaleString()} characters of text found. The site now uses this resume.`,
      });
      if (inputRef.current) inputRef.current.value = '';
      router.refresh();
    } catch {
      setStatus({ kind: 'error', message: 'The upload did not reach the server. Check your connection and try again.' });
    }
  };

  return (
    <form onSubmit={upload} className="space-y-4">
      <div>
        <label htmlFor="resume-file" className="block text-sm font-medium text-ink">
          New resume (PDF, up to 10 MB)
        </label>
        <input
          id="resume-file"
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="mt-2 block w-full text-sm text-ink file:mr-4 file:min-h-11 file:cursor-pointer file:rounded-lg file:border-0 file:bg-surface file:px-4 file:font-medium file:text-ink"
        />
      </div>
      <button
        type="submit"
        disabled={status.kind === 'uploading'}
        className="inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-fill px-5 text-sm font-semibold text-onfill hover:brightness-95 disabled:cursor-wait disabled:opacity-60"
      >
        {status.kind === 'uploading' ? 'Uploading and reading the PDF…' : 'Upload and replace'}
      </button>
      <p role="status" aria-live="polite" className="min-h-6 text-sm">
        {status.kind === 'done' && <span className="text-emerald-700 dark:text-emerald-400">{status.message}</span>}
        {status.kind === 'error' && <span className="text-red-700 dark:text-red-400">Not uploaded: {status.message}</span>}
      </p>
    </form>
  );
}
