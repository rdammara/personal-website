import type { Metadata } from 'next';
import { site } from '@/lib/site';
import { resume } from '@/lib/resume';
import { PageHeader } from '@/components/PageHeader';

export const metadata: Metadata = { title: 'Resume', description: resume.summary };

const sectionGrid = 'grid gap-6 border-t border-line pt-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] md:gap-14';
const sectionTitle = 'm-0 text-[26px] font-bold tracking-[-0.02em]';

export default function ResumePage() {
  return (
    <div className="mx-auto max-w-[1180px] px-5 pb-30 sm:px-10 max-sm:pb-18">
      <PageHeader title="Resume" intro={resume.summary}>
        {site.resumePdfUrl && (
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href={site.resumePdfUrl}
              download
              className="inline-flex min-h-12 items-center rounded-full bg-fill px-6 font-semibold text-onfill no-underline"
            >
              Download resume (PDF)
            </a>
          </div>
        )}
      </PageHeader>

      <section className={sectionGrid}>
        <h2 className={sectionTitle}>Experience</h2>
        <ol className="m-0 list-none p-0">
          {resume.experience.map((job) => (
            <li key={job.organization} className="border-b border-line pb-8 [&+li]:pt-8">
              <p className="m-0 text-[19px] font-bold">{job.organization}</p>
              <p className="mb-0 mt-0.5 text-[15px] text-muted">{job.location}</p>
              {job.roles.map((role) => (
                <div key={role.title} className="mt-5">
                  <p className="m-0 font-semibold">{role.title}</p>
                  <p className="mb-0 mt-0.5 font-mono text-[13px] text-muted">{role.dates}</p>
                  <p className="mb-0 mt-2 max-w-[42em]">{role.detail}</p>
                </div>
              ))}
            </li>
          ))}
        </ol>
      </section>

      <section className={`mt-14 ${sectionGrid}`}>
        <h2 className={sectionTitle}>Skills</h2>
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {resume.skills.map((skill) => (
            <li key={skill} className="rounded-lg border border-line px-3 py-1.5 text-[15px]">
              {skill}
            </li>
          ))}
        </ul>
      </section>

      <section className={`mt-14 ${sectionGrid}`}>
        <h2 className={sectionTitle}>Education</h2>
        <ol className="m-0 list-none p-0">
          {resume.education.map((school) => (
            <li key={school.name} className="border-b border-line pb-8 [&+li]:pt-8">
              <p className="m-0 text-[19px] font-bold">{school.name}</p>
              <p className="mb-0 mt-0.5 text-[15px] text-muted">{school.location}</p>
              <p className="mb-0 mt-4 font-semibold">{school.degree}</p>
              <p className="mb-0 mt-0.5 font-mono text-[13px] text-muted">{school.dates}</p>
              <ul className="mb-0 mt-2 list-disc space-y-1 pl-5">
                {school.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
