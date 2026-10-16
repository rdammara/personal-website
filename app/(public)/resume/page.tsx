import type { Metadata } from 'next';
import { getCurrentResume } from '@/lib/resume-file';
import { formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/PageHeader';

export const revalidate = 0;

export const metadata: Metadata = { title: 'Resume' };

export default async function ResumePage() {
  const resume = await getCurrentResume();

  if (!resume) {
    return (
      <div className="mx-auto max-w-[1180px] px-5 pb-30 sm:px-10 max-sm:pb-18">
        <PageHeader title="Resume" intro="My resume will be available here soon." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1180px] px-5 pb-30 sm:px-10 max-sm:pb-18">
      <PageHeader title="Resume">
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <a
            href="/download/resume"
            className="inline-flex min-h-12 items-center rounded-full bg-fill px-6 font-semibold text-onfill no-underline"
          >
            Download resume (PDF)
          </a>
          <span className="font-mono text-[13px] text-muted">Updated {formatDate(resume.uploadedAt)}</span>
        </div>
      </PageHeader>

      {/* Phone browsers often can't show a PDF inside a page, so the embed is for wider screens */}
      <iframe
        src="/download/resume?inline=1"
        title="Resume PDF"
        className="hidden h-[min(1150px,85vh)] w-full rounded-xl border border-line bg-surface md:block"
      />

      {/* Phones: the text is the resume, so it is always shown */}
      <section className="border-t border-line pt-8 md:hidden">
        <h2 className="m-0 text-[22px] font-bold">Text version</h2>
        <div className="mt-4 whitespace-pre-line text-[16px] leading-relaxed">{resume.text}</div>
      </section>

      {/* Wider screens: the PDF is above, so the text is tucked away for screen readers and copying */}
      <details className="mt-8 hidden border-t border-line pt-6 md:block">
        <summary className="inline-flex min-h-11 cursor-pointer items-center font-semibold text-accent">
          Text version
        </summary>
        <div className="mt-4 max-w-[46em] whitespace-pre-line text-[17px] leading-relaxed">{resume.text}</div>
      </details>
    </div>
  );
}
