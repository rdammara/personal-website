import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Raw HTML in post content is not rendered (react-markdown's default), so a
// post can't inject markup into the page.
const components: Components = {
  h2: ({ children }) => <h2 className="mb-0 mt-12 text-[28px] font-bold leading-tight tracking-[-0.02em]">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-0 mt-10 text-[23px] font-bold leading-snug">{children}</h3>,
  h4: ({ children }) => <h4 className="mb-0 mt-8 text-[19px] font-bold">{children}</h4>,
  p: ({ children }) => <p className="mb-0 mt-6">{children}</p>,
  a: ({ href, children }) => (
    <a href={href} className="font-semibold text-accent underline underline-offset-2 hover:no-underline">
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="mb-0 mt-6 list-disc space-y-2 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="mb-0 mt-6 list-decimal space-y-2 pl-6">{children}</ol>,
  blockquote: ({ children }) => (
    <blockquote className="mx-0 mb-0 mt-6 rounded-xl bg-surface px-5 py-1 [&>p]:mt-4 [&>p:last-child]:mb-4">{children}</blockquote>
  ),
  hr: () => <hr className="my-10 border-0 border-t border-line" />,
  pre: ({ children }) => (
    <pre className="mb-0 mt-6 overflow-x-auto rounded-xl bg-band p-5 font-mono text-[15px] leading-relaxed text-onband">
      {children}
    </pre>
  ),
  code: ({ className, children }) =>
    className ? (
      <code className={className}>{children}</code>
    ) : (
      <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-[0.88em]">{children}</code>
    ),
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element -- sizes come from Notion and are unknown here
    <img src={typeof src === 'string' ? src : undefined} alt={alt ?? ''} loading="lazy" className="mt-6 h-auto max-w-full rounded-xl" />
  ),
  table: ({ children }) => (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse text-[16px]">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border-b-2 border-ink px-3 py-2 text-left font-semibold">{children}</th>,
  td: ({ children }) => <td className="border-b border-line px-3 py-2 align-top">{children}</td>,
};

export function Markdown({ children }: { children: string }) {
  return (
    <div className="text-[19px] leading-relaxed [&>:first-child]:mt-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

// Plain-text preview for lists, with Markdown syntax removed
export function markdownToText(md: string) {
  // Escaped characters are literal text; park them so the marker stripping below skips them
  const escaped: string[] = [];
  return md
    .replace(/\\([\\`*_[\]<|])/g, (_, c: string) => `\u0000${escaped.push(c) - 1}\u0000`)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+|^>\s?|^\s*[-*]\s+(\[[ x]\]\s+)?|^\s*\d+\.\s+|^\s*\|?\s*-{3,}.*$/gm, '')
    .replace(/[*_`~|]/g, '')
    .replace(/<(https?:[^>]+)>/g, '$1')
    .replace(/\u0000(\d+)\u0000/g, (_, i: string) => escaped[Number(i)]);
}
