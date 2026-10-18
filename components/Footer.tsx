import { site, builtAt } from '@/lib/site';

function formatBuildTime(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  }).format(new Date(iso));
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1180px] flex-wrap justify-between gap-2 px-5 py-6 text-sm text-muted sm:px-10">
        <span>
          © {new Date().getFullYear()} {site.name}
        </span>
        {builtAt && <span className="font-mono text-[13px]">Site rebuilt {formatBuildTime(builtAt)}</span>}
      </div>
    </footer>
  );
}
