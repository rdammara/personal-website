import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/lib/site';
import { PageHeader } from '@/components/PageHeader';

export const metadata: Metadata = { title: 'Resume' };

// Drawn only from what Albert wrote in the About text; dates and employers are
// left out until the real resume is added.
const experience = [
  { role: 'Software Quality Engineer', note: 'Current role' },
  { role: 'Industrial analytics', note: 'Machine sensor data for predictive maintenance and equipment reliability' },
  {
    role: 'Data engineering, industrial piping manufacturing',
    note: 'Real-time pipelines for sensor data across production sites, connecting edge data to the central MES',
  },
];

export default function ResumePage() {
  return (
    <div className="mx-auto max-w-[1180px] px-5 pb-30 sm:px-10 max-sm:pb-18">
      <PageHeader title="Resume">
        <div className="mt-8 flex flex-wrap items-center gap-4">
          {site.resumePdfUrl ? (
            <a
              href={site.resumePdfUrl}
              download
              className="inline-flex min-h-12 items-center rounded-full bg-fill px-6 font-semibold text-onfill no-underline"
            >
              Download resume (PDF)
            </a>
          ) : (
            <p className="m-0 text-muted">The PDF version will be available here soon.</p>
          )}
        </div>
      </PageHeader>

      <section className="grid gap-6 border-t border-line pt-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] md:gap-14">
        <h2 className="m-0 text-[26px] font-bold tracking-[-0.02em]">Experience</h2>
        <ol className="m-0 list-none p-0">
          {experience.map((item) => (
            <li key={item.role} className="border-b border-line pb-6 pt-0 [&+li]:pt-6">
              <p className="m-0 text-[19px] font-semibold">{item.role}</p>
              <p className="mb-0 mt-1 text-muted">{item.note}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14 grid gap-6 border-t border-line pt-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] md:gap-14">
        <h2 className="m-0 text-[26px] font-bold tracking-[-0.02em]">Education</h2>
        <p className="m-0 text-[19px]">Information Systems, with a minor in Big Data Analytics</p>
      </section>

      <p className="mt-14 text-muted">
        The longer story is in the{' '}
        <Link href="/#about" className="font-semibold text-accent hover:underline">
          About section
        </Link>
        .
      </p>
    </div>
  );
}
