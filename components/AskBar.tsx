'use client';

import * as React from 'react';
import { LogoMark } from './Logo';

interface Message {
  id: number;
  from: 'visitor' | 'site';
  text: string;
  sources?: string[];
  failed?: boolean;
}

export function AskBar() {
  const [draft, setDraft] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const logRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, loading]);

  const ask = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = draft.trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { id: Date.now(), from: 'visitor', text: question }]);
    setDraft('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data: { reply: string; sources?: { source: string }[] } = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          from: 'site',
          text: data.reply,
          sources: data.sources?.map((s) => s.source),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          from: 'site',
          text: 'The answer could not be loaded. Check your connection and ask again.',
          failed: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-11 max-w-[640px] text-left max-sm:mt-10">
      <form
        onSubmit={ask}
        className="flex items-center gap-2 rounded-full border-[1.5px] border-control bg-bg py-1.5 pl-5 pr-1.5 focus-within:border-accent focus-within:shadow-[0_0_0_1px_var(--accent)]"
      >
        <label htmlFor="ask" className="sr-only">
          Ask about Albert’s work
        </label>
        <input
          id="ask"
          type="text"
          autoComplete="off"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask about my work, projects or resume"
          className="h-11 min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-muted focus-visible:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          aria-label="Send question"
          className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-fill text-onfill disabled:cursor-wait"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current stroke-[2.2] [stroke-linecap:round] [stroke-linejoin:round]">
            <path d="M12 19V5M5.5 11.5L12 5l6.5 6.5" />
          </svg>
        </button>
      </form>
      <p className="mt-3 text-center text-sm text-muted">
        Answers come only from what’s published on this website.
      </p>

      {messages.length > 0 && (
        <div
          ref={logRef}
          role="log"
          aria-label="Conversation"
          aria-live="polite"
          className="mt-4 max-h-[420px] overflow-y-auto rounded-[20px] bg-surface px-4 pb-[18px] pt-2"
        >
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setMessages([])}
              aria-label="Clear conversation"
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center text-ink"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8] [stroke-linecap:round]">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          {messages.map((m) =>
            m.from === 'visitor' ? (
              <div key={m.id} className="mt-2.5 flex justify-end">
                <p className="max-w-[85%] rounded-2xl bg-ink px-3.5 py-2.5 text-base text-bg">{m.text}</p>
              </div>
            ) : (
              <div key={m.id} className="mt-2.5 flex items-start gap-2.5">
                <LogoMark className="mt-1 h-[30px] w-[26px] shrink-0" cutColor="var(--surface)" />
                <div className="max-w-[85%]">
                  <p className={`whitespace-pre-line rounded-2xl bg-bg px-3.5 py-2.5 text-base ${m.failed ? 'text-accent' : 'text-ink'}`}>
                    {m.text}
                  </p>
                  {m.sources && m.sources.length > 0 && (
                    <p className="mt-1.5 px-1 font-mono text-[13px] text-muted">From: {m.sources.join(' · ')}</p>
                  )}
                </div>
              </div>
            )
          )}
          {loading && (
            <p className="mt-3 flex items-center gap-2.5 text-[15px] text-muted">
              <LogoMark className="h-[30px] w-[26px] shrink-0" cutColor="var(--surface)" />
              Searching the site…
            </p>
          )}
        </div>
      )}
    </div>
  );
}
