import { getCurrentResume } from '@/lib/resume-file';
import { UploadForm } from './UploadForm';

export const dynamic = 'force-dynamic';

const formatWhen = (d: Date) =>
  new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(d) + ' UTC';

export default async function AdminResumePage() {
  const current = await getCurrentResume();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resume</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Upload a new PDF to replace the resume on the site. The download button, the resume page and the ask bar all
          switch to it straight away.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-semibold">Current resume</h2>
        {current ? (
          <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-[140px_1fr]">
            <dt className="text-slate-600 dark:text-slate-400">File</dt>
            <dd>{current.fileName}</dd>
            <dt className="text-slate-600 dark:text-slate-400">Uploaded</dt>
            <dd>{formatWhen(current.uploadedAt)}</dd>
            <dt className="text-slate-600 dark:text-slate-400">Size</dt>
            <dd>
              {(current.bytes / 1024).toFixed(0)} KB, {current.pages} page{current.pages === 1 ? '' : 's'}
            </dd>
            <dt className="text-slate-600 dark:text-slate-400">Links</dt>
            <dd className="flex flex-wrap gap-x-4">
              <a href="/download/resume?inline=1" className="font-medium text-blue-700 hover:underline dark:text-blue-400">
                Open the PDF
              </a>
              <a href="/resume" className="font-medium text-blue-700 hover:underline dark:text-blue-400">
                See the resume page
              </a>
            </dd>
          </dl>
        ) : (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            No resume uploaded yet. The resume page says so until you upload one.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-base font-semibold">Upload a new version</h2>
        <UploadForm />
      </section>
    </div>
  );
}
