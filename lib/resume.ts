import { readContent } from './content';

export type Resume = { file: string; bytes: number; pages: number; text: string; updatedAt: string };

// From the PDF on the Notion "Resume" page
export async function getCurrentResume() {
  return readContent<Resume>('resume.json');
}
