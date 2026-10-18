'use client';

import * as React from 'react';
import { LogoMark } from './Logo';

interface Message {
  id: number;
  from: 'visitor' | 'site';
  text: string;
  sources?: { label: string; href: string }[];
  failed?: boolean;
}

export function AskBar() {
  const [draft, setDraft] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const logRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, loading]);

  const ask = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = draft.trim();
    if (!question || loading) return;

    // Earlier turns go along so follow-up questions make sense; failed replies are left out
    const history = messages.filter((m) => !m.failed).slice(-6).map(({ from, text }) => ({ from, text }));
    setMessages((prev) => [...prev, { id: Date.now(), from: 'visitor', text: question }]);
    setDraft('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, history }),
      });
      if (res.status === 429) throw new Error('busy');
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data: { reply: string; sources?: { label: string; href: string }[] } = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          from: 'site',
          text: data.reply,
          sources: data.sources,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          from: 'site',
          text:
            (error as Error).message === 'busy'
              ? 'That’s a lot of questions in a short time. Wait a minute and ask again.'
              : 'The answer could not be loaded. Check your connection and ask again.',
          failed: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // After the first question the bar becomes a chat box: the conversation on top, the
  // same input at the bottom. The form keeps its place among its siblings (the
  // conditional children before it render as nothing when hidden), so React keeps the
  // input mounted and focus stays in it when the layout changes.
  const chatting = messages.length > 0;

  return (
    <div className="mx-auto mt-11 max-w-[640px] text-left max-sm:mt-10">
      <div
        className={
          chatting
            ? 'flex h-[min(560px,72dvh)] flex-col overflow-hidden rounded-[24px] border border-line bg-surface'
            : undefined
        }
      >
        {chatting && (
          <div className="flex shrink-0 justify-end px-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setMessages([]);
                // The button disappears with the conversation, so focus goes back to the input
                inputRef.current?.focus();
              }}
              aria-label="Clear conversation"
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-ink hover:bg-bg"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.8] [stroke-linecap:round]">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        )}
        {chatting && (
          <div
            ref={logRef}
            role="log"
            aria-label="Conversation"
            aria-live="polite"
            className="min-h-0 flex-1 overflow-y-auto px-4 pb-4"
          >
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
                      <p className="mt-1.5 px-1 font-mono text-[13px] text-muted">
                        From:{' '}
                        {m.sources.map((s, i) => (
                          <span key={`${s.label}-${i}`}>
                            {i > 0 && ' · '}
                            <a href={s.href} className="text-muted underline underline-offset-2 hover:text-accent">
                              {s.label}
                            </a>
                          </span>
                        ))}
                      </p>
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
        <form
          onSubmit={ask}
          className={`flex shrink-0 items-center gap-2 rounded-full border-[1.5px] border-control bg-bg py-1.5 pl-5 pr-1.5 focus-within:border-accent focus-within:shadow-[0_0_0_1px_var(--accent)] ${
            chatting ? 'm-3 mt-0' : ''
          }`}
        >
          <label htmlFor="ask" className="sr-only">
            Ask about Albert’s work
          </label>
          <input
            id="ask"
            ref={inputRef}
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
      </div>
      <p className="mt-3 text-center text-sm text-muted">
        Answers come from this website and my resume. They’re written by AI and can be wrong.
      </p>
    </div>
  );
}
