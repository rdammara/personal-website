import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/lib/site';
import { PageHeader } from '@/components/PageHeader';

export const metadata: Metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[1180px] px-5 pb-30 sm:px-10 max-sm:pb-18">
      <PageHeader
        title="Contact"
        intro="Have data that needs a pipeline, or a question that needs an answer? I’m glad to hear about roles and projects."
      />

      <dl className="m-0 border-t border-line">
        <div className="grid gap-1 border-b border-line py-6 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-6">
          <dt className="font-semibold">Email</dt>
          <dd className="m-0">
            {site.contactEmail ? (
              <a href={`mailto:${site.contactEmail}`} className="text-[19px] font-semibold text-accent hover:underline">
                {site.contactEmail}
              </a>
            ) : (
              <span className="text-muted">Will be listed here soon.</span>
            )}
          </dd>
        </div>
        <div className="grid gap-1 border-b border-line py-6 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-6">
          <dt className="font-semibold">GitHub</dt>
          <dd className="m-0">
            <a href={site.githubUrl} className="font-mono text-accent hover:underline">
              {site.githubUrl.replace('https://', '')}
            </a>
          </dd>
        </div>
        <div className="grid gap-1 border-b border-line py-6 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-6">
          <dt className="font-semibold">Quick questions</dt>
          <dd className="m-0 text-muted">
            The{' '}
            <Link href="/" className="font-semibold text-accent hover:underline">
              ask bar on the home page
            </Link>{' '}
            answers from everything published on this site.
          </dd>
        </div>
      </dl>
    </div>
  );
}
