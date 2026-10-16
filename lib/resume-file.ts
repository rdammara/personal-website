import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from './prisma';

// Uploaded resumes live outside public/, which only serves files present at build time
const RESUME_DIR = path.join(process.cwd(), 'storage', 'resume');
export const MAX_RESUME_BYTES = 10 * 1024 * 1024;
export const RESUME_DOWNLOAD_NAME = 'Albert-Richard-Dammara-Resume.pdf';

const filePath = (id: string) => path.join(RESUME_DIR, `${id}.pdf`);

export function getCurrentResume() {
  return prisma.resumeFile.findFirst({ orderBy: { uploadedAt: 'desc' } });
}

export async function readResumePdf(id: string) {
  return readFile(filePath(id));
}

// Text in reading order, one PDF line per text line
async function extractText(bytes: Uint8Array) {
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await getDocument({ data: bytes, isEvalSupported: false, useSystemFonts: false }).promise;
  try {
    const pages: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const content = await (await doc.getPage(i)).getTextContent();
      let text = '';
      for (const item of content.items) {
        if (!('str' in item)) continue;
        text += item.str + (item.hasEOL ? '\n' : '');
      }
      pages.push(text.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim());
    }
    return { pages: doc.numPages, text: pages.join('\n\n') };
  } finally {
    await doc.destroy();
  }
}

export class ResumeUploadError extends Error {}

export async function saveResume(bytes: Uint8Array, fileName: string) {
  if (bytes.byteLength === 0) throw new ResumeUploadError('The file is empty.');
  if (bytes.byteLength > MAX_RESUME_BYTES) throw new ResumeUploadError('The file is larger than 10 MB.');
  // Every PDF starts with "%PDF-"; this rejects other files renamed to .pdf
  if (Buffer.from(bytes.subarray(0, 5)).toString('latin1') !== '%PDF-') {
    throw new ResumeUploadError('That file is not a PDF.');
  }

  let extracted: { pages: number; text: string };
  try {
    // pdf.js may take ownership of the buffer it is given, so it gets a copy
    extracted = await extractText(bytes.slice());
  } catch {
    throw new ResumeUploadError('The PDF could not be read. Try exporting it again.');
  }
  if (extracted.text.length < 50) {
    throw new ResumeUploadError('No text was found in the PDF. If it is a scanned image, export it as a text PDF instead.');
  }

  const row = await prisma.resumeFile.create({
    data: { fileName: fileName.slice(0, 200), bytes: bytes.byteLength, pages: extracted.pages, text: extracted.text },
  });
  try {
    await mkdir(RESUME_DIR, { recursive: true });
    // Write then rename, so a reader never sees a half-written file
    const tmp = `${filePath(row.id)}.tmp`;
    await writeFile(tmp, bytes);
    await rename(tmp, filePath(row.id));
  } catch (error) {
    await prisma.resumeFile.delete({ where: { id: row.id } });
    throw error;
  }
  return row;
}
