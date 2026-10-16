import { prisma } from './prisma';
import { site } from './site';
import { markdownToText } from '@/components/Markdown';
import { getCurrentResume } from './resume-file';

export interface DocumentChunk {
  id: string;
  source: string;
  title: string;
  content: string;
  score?: number;
}

/**
 * Splits text into chunks of whole sentences for retrieval.
 */
export function chunkText(text: string, maxLength: number = 450): string[] {
  // Split on sentence ends and bullets so every chunk starts at a sentence, never mid-word
  const sentences = text
    .replace(/\s*\n\s*/g, ' ')
    .split(/(?<=[.!?])\s+|\s*•\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = '';
  for (const sentence of sentences) {
    if (current && current.length + 1 + sentence.length > maxLength) {
      chunks.push(current);
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/**
 * Basic term frequency vector generator for text retrieval.
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function calculateBM25Score(queryTokens: string[], docTokens: string[], docLength: number, avgDocLength: number): number {
  const k1 = 1.5;
  const b = 0.75;
  let score = 0;

  const docFreqMap = new Map<string, number>();
  for (const token of docTokens) {
    docFreqMap.set(token, (docFreqMap.get(token) || 0) + 1);
  }

  for (const qToken of queryTokens) {
    const f = docFreqMap.get(qToken) || 0;
    if (f > 0) {
      const numerator = f * (k1 + 1);
      const denominator = f + k1 * (1 - b + b * (docLength / (avgDocLength || 1)));
      score += numerator / denominator;
    }
  }

  return score;
}

/**
 * Retrieves the most relevant knowledge base chunks for a user query.
 * Gathers content from published BlogPosts, Projects, and knowledge snippets.
 */
export async function retrieveRagContext(query: string, limit: number = 3): Promise<DocumentChunk[]> {
  try {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) {
      return [];
    }

    // 1. Fetch knowledge sources from SQLite database
    const [posts, projects] = await Promise.all([
      prisma.blogPost.findMany({
        where: { published: true },
        select: { id: true, title: true, content: true, slug: true },
      }),
      prisma.project.findMany({
        select: { id: true, title: true, description: true, externalUrl: true },
      }),
    ]);

    const candidateChunks: DocumentChunk[] = [];

    // The About text lives in code rather than the database
    site.about.forEach((paragraph, index) => {
      candidateChunks.push({
        id: `about-${index}`,
        source: 'About (/#about)',
        title: 'About Albert',
        content: paragraph,
      });
    });

    const resume = await getCurrentResume();
    if (resume) {
      chunkText(resume.text).forEach((chunk, index) => {
        candidateChunks.push({ id: `resume-${index}`, source: 'Resume (/resume)', title: 'Resume', content: chunk });
      });
    }

    // Chunk blog posts
    for (const post of posts) {
      const chunks = chunkText(markdownToText(post.content));
      chunks.forEach((chunk, index) => {
        candidateChunks.push({
          id: `blog-${post.id}-${index}`,
          source: `Post: ${post.title} (/blog/${post.slug})`,
          title: post.title,
          content: chunk,
        });
      });
    }

    // Add projects
    for (const project of projects) {
      candidateChunks.push({
        id: `project-${project.id}`,
        source: `Project: ${project.title}`,
        title: project.title,
        content: `${project.title}: ${project.description}. External link: ${project.externalUrl || 'N/A'}`,
      });
    }

    if (candidateChunks.length === 0) {
      return [];
    }

    // 2. Score candidate chunks against the user query
    const docTokensList = candidateChunks.map((c) => tokenize(`${c.title} ${c.content}`));
    const avgLength = docTokensList.reduce((acc, t) => acc + t.length, 0) / docTokensList.length;

    const scoredChunks = candidateChunks.map((chunk, i) => {
      const tokens = docTokensList[i];
      const score = calculateBM25Score(queryTokens, tokens, tokens.length, avgLength);
      return { ...chunk, score };
    });

    // 3. Filter and rank chunks with positive score
    return scoredChunks
      .filter((c) => (c.score || 0) > 0)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limit);
  } catch (error) {
    console.error('Error during RAG context retrieval:', error);
    return [];
  }
}
