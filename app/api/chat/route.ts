import { NextRequest, NextResponse } from 'next/server';
import { retrieveRagContext } from '@/lib/rag';
import { askModel, MAX_HISTORY, MAX_QUESTION_CHARS, type Turn } from '@/lib/ask';

function readHistory(value: unknown): Turn[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((t): t is Turn => (t?.from === 'visitor' || t?.from === 'site') && typeof t?.text === 'string')
    .slice(-MAX_HISTORY)
    .map((t) => ({ from: t.from, text: t.text.slice(0, 1000) }));
}

export async function POST(req: NextRequest) {
  let body: { message?: unknown; history?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Send JSON with a "message" field.' }, { status: 400 });
  }

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) return NextResponse.json({ error: 'Ask a question first.' }, { status: 400 });
  if (message.length > MAX_QUESTION_CHARS) {
    return NextResponse.json({ error: `Keep questions under ${MAX_QUESTION_CHARS} characters.` }, { status: 400 });
  }

  // The model answers when it can; otherwise the keyword search does, as before
  const ai = await askModel(message, readHistory(body.history));
  if (ai) return NextResponse.json({ reply: ai.answer, sources: ai.sources, mode: 'ai' });

  const matches = await retrieveRagContext(message, 3);
  return NextResponse.json({
    reply:
      matches.length > 0
        ? matches[0].content
        : 'I couldn’t find anything on this site about that. Try asking about Albert’s background, projects or posts.',
    // One link per source, even when several passages came from it
    sources: [...new Map(matches.map((s) => [s.source, s])).values()].map((s) => ({
      id: s.id,
      label: s.source.replace(/ \(.*\)$/, ''),
      href: s.source.match(/\((\/[^)]*)\)$/)?.[1] ?? '/',
    })),
    mode: 'search',
  });
}
