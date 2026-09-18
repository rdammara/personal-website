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

    // 2. Synthesize a response based on retrieved database documents
    let reply = '';

    if (sources.length > 0) {
      const topSource = sources[0];
      const contextSummary = sources
        .map((s) => `[${s.source}]: ${s.content.slice(0, 200)}...`)
        .join('\n\n');

      reply = `Based on the project database records:\n\n${topSource.content}\n\nRelevant Sources Found: ${sources.map((s) => s.title).join(', ')}.`;
    } else {
      reply = `I couldn't find specific documentation matching "${message}" in the local database. You can browse our Blog and Portfolio sections, or ask about Next.js, App Router, or Prisma configuration.`;
    }

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
