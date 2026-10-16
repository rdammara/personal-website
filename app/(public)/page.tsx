import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { site } from '@/lib/site';
import { formatDate, timeAgo, excerpt } from '@/lib/utils';
import { getPublishedPosts, getLastNotionSync, postDate, postSummary } from '@/lib/posts';
import { AskBar } from '@/components/AskBar';
import { PipelineDiagram } from '@/components/PipelineDiagram';

export const revalidate = 0;

const container = 'mx-auto max-w-[1180px] px-5 sm:px-10';
const h2 = 'm-0 text-[clamp(32px,4.4vw,56px)] font-bold leading-[1.05] tracking-[-0.03em]';

function isGitHub(url: string) {
  return /^https:\/\/github\.com\//.test(url);
}

export default async function HomePage() {
  const [posts, projects, lastSync] = await Promise.all([
    getPublishedPosts(3),
    prisma.project.findMany({ orderBy: { createdAt: 'desc' }, take: 4 }),
    getLastNotionSync(),
  ]);
  const syncedAt = lastSync?.finishedAt ?? null;
  const [featured, ...moreProjects] = projects;

  return (
    <>
      <section className="pb-30 pt-34 text-center max-sm:pb-16 max-sm:pt-18">
        <div className={container}>
          <h1 className="mx-auto max-w-[19ch] text-[clamp(36px,5.6vw,72px)] font-bold leading-[1.04] tracking-[-0.035em]">
            {site.title}
          </h1>
          <AskBar />
        </div>
      </section>

      <section id="about" className="scroll-mt-16 pb-30 max-sm:pb-18">
        <div className={container}>
          <div className="border-t border-line" />
          <div className="mt-24 grid gap-7 max-sm:mt-16 md:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] md:gap-14">
            <div>
              <h2 className={h2}>About</h2>
              <Image
                src="/images/albert-richard-dammara.jpg"
                alt={site.name}
                width={750}
                height={750}
                sizes="(max-width: 767px) 220px, 300px"
                className="mt-8 aspect-square w-full max-w-[220px] rounded-2xl object-cover md:max-w-[300px]"
              />
            </div>
            <div className="max-w-[38em] text-[19px] leading-relaxed">
              {site.about.map((paragraph, i) => (
                <p key={i} className={i === 0 ? 'm-0' : 'mb-0 mt-6'}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="work" className="band scroll-mt-16 bg-band py-30 text-onband max-sm:py-18">
        <div className={container}>
          <h2 className={h2}>Work</h2>
          <p className="mb-14 mt-4 max-w-[34em] text-[19px] text-bandmuted">
            My projects live on GitHub while I write them up properly. Each one will get a page here with the problem, the
            stack and what came out of it.
          </p>

          {featured ? (
            <div className="grid gap-12 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
              <div>
                <p className="font-mono text-[13px] text-bandmuted">Latest · {formatDate(featured.createdAt)}</p>
                <h3 className="mt-2 text-[30px] font-bold leading-tight tracking-[-0.02em]">{featured.title}</h3>
                <p className="mt-4 text-bandmuted">{featured.description}</p>
                {featured.externalUrl && (
                  <p className="mt-7 font-semibold">
                    <a href={featured.externalUrl} className="text-bandaccent hover:underline">
                      {isGitHub(featured.externalUrl) ? 'View the code on GitHub' : 'Visit the project'}
                    </a>
                  </p>
                )}
              </div>
              {moreProjects.length > 0 && (
                <ul className="m-0 list-none p-0">
                  {moreProjects.map((p) => (
                    <li key={p.id} className="border-t border-bandline py-5">
                      <p className="font-semibold">{p.title}</p>
                      <p className="mt-1 text-[15px] text-bandmuted">{excerpt(p.description, 110)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className="text-bandmuted">No project write-ups are published yet.</p>
          )}

          <div className="mt-18 flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-bandline pt-7">
            <Link href="/portfolio" className="font-semibold text-onband hover:text-bandaccent">
              All work
            </Link>
            <a href={site.githubUrl} className="text-bandmuted hover:text-bandaccent">
              All repositories on GitHub
            </a>
          </div>
        </div>
      </section>

      <section id="blog" className="scroll-mt-16 py-30 max-sm:py-18">
        <div className={container}>
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className={h2}>Blog</h2>
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
              {syncedAt && <span className="font-mono text-[14px] text-muted">Synced from Notion {timeAgo(syncedAt)}</span>}
              <Link href="/blog" className="font-semibold text-accent hover:underline">
                All posts
              </Link>
            </div>
          </div>
          <p className="mb-12 mt-0 max-w-[36em] text-[19px] text-muted">Notes on data engineering and the work around it.</p>

          {posts.length > 0 ? (
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 max-sm:gap-7">
              {posts.map((post) => (
                <article key={post.id} className="border-t-2 border-ink pt-5">
                  <p className="font-mono text-[13px] text-muted">{formatDate(postDate(post))}</p>
                  <h3 className="mt-2.5 text-[22px] font-bold leading-tight tracking-[-0.01em]">
                    <Link href={`/blog/${post.slug}`} className="text-ink no-underline hover:text-accent">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-2.5 text-muted">{postSummary(post, 120)}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-muted">No posts are published yet.</p>
          )}
        </div>
      </section>

      <section id="how" className="scroll-mt-16 pb-30 max-sm:pb-18">
        <div className={container}>
          <h2 className={h2}>How this site works</h2>
          <p className="mb-12 mt-4 max-w-[36em] text-[19px] text-muted">
            It runs on a small pipeline. {syncedAt ? 'I write posts in Notion, and a sync job copies them into the database every 15 minutes.' : 'I’m connecting a sync from Notion, so posts I write there publish here.'}{' '}
            The pages are built from that database, and the ask bar at the top searches the same data.
          </p>
          <PipelineDiagram notionLive={Boolean(syncedAt)} />
        </div>
      </section>

      <section className="pb-30 max-sm:pb-18">
        <div className={`${container} grid gap-6 md:grid-cols-2`}>
          <div id="resume" className="scroll-mt-16 rounded-[20px] bg-surface p-10 max-sm:p-7">
            <h2 className="m-0 text-[30px] font-bold tracking-[-0.02em]">Resume</h2>
            <p className="mt-3.5 text-muted">My experience, education and the tools I use.</p>
            <Link
              href="/resume"
              className="mt-7 inline-flex min-h-12 items-center rounded-full bg-fill px-6 font-semibold text-onfill no-underline"
            >
              View my resume
            </Link>
          </div>
          <div id="contact" className="scroll-mt-16 rounded-[20px] bg-surface p-10 max-sm:p-7">
            <h2 className="m-0 text-[30px] font-bold leading-[1.15] tracking-[-0.02em]">
              Have data that needs a pipeline, or a question that needs an answer?
            </h2>
            {site.contactEmail ? (
              <p className="mt-7 text-[21px] font-semibold">
                <a href={`mailto:${site.contactEmail}`} className="text-ink hover:text-accent">
                  {site.contactEmail}
                </a>
              </p>
            ) : (
              <p className="mt-4 text-muted">
                My email address will be listed here soon. Until then, you can find me on{' '}
                <a href={site.githubUrl} className="font-semibold text-accent hover:underline">
                  GitHub
                </a>
                .
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
