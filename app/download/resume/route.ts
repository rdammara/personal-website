import { NextRequest } from 'next/server';
import { getCurrentResume, readResumePdf, RESUME_DOWNLOAD_NAME } from '@/lib/resume-file';

export const dynamic = 'force-dynamic';

// The newest uploaded resume. ?inline=1 shows it in the browser instead of downloading.
export async function GET(req: NextRequest) {
  const resume = await getCurrentResume();
  if (!resume) return new Response('No resume uploaded yet', { status: 404 });

  try {
    const bytes = await readResumePdf(resume.id);
    const inline = req.nextUrl.searchParams.get('inline') === '1';
    return new Response(new Uint8Array(bytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="${RESUME_DOWNLOAD_NAME}"`,
        // The same URL serves each new upload, so browsers must check back
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response('Resume file missing', { status: 404 });
  }
}
