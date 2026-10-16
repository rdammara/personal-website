import { NextRequest, NextResponse } from 'next/server';
import { retrieveRagContext } from '@/lib/rag';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: "message" string is required.' },
        { status: 400 }
      );
    }

    // 1. Retrieve knowledge chunks via RAG BM25 / semantic scoring
    const sources = await retrieveRagContext(message, 3);

    // 2. No language model yet: reply with the best-matching passage, sources listed separately
    const reply =
      sources.length > 0
        ? sources[0].content
        : 'I couldn’t find anything on this site about that yet. Try asking about my background, my projects or my posts.';

    return NextResponse.json({
      reply,
      sources: sources.map((s) => ({
        id: s.id,
        title: s.title,
        source: s.source,
      })),
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
