import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, unauthorized } from '@/lib/auth';
import { saveResume, ResumeUploadError, MAX_RESUME_BYTES } from '@/lib/resume-file';

export async function POST(req: NextRequest) {
  if (!(await getSessionUser())) return unauthorized();

  // Refuse oversized uploads before reading the body
  const declared = Number(req.headers.get('content-length') ?? 0);
  if (declared > MAX_RESUME_BYTES + 64 * 1024) {
    return NextResponse.json({ error: 'The file is larger than 10 MB.' }, { status: 413 });
  }

  let file: FormDataEntryValue | null;
  try {
    file = (await req.formData()).get('file');
  } catch {
    return NextResponse.json({ error: 'Send the PDF as form data in a field named "file".' }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Choose a PDF file to upload.' }, { status: 400 });
  }

  try {
    const row = await saveResume(new Uint8Array(await file.arrayBuffer()), file.name);
    return NextResponse.json(
      { uploadedAt: row.uploadedAt, pages: row.pages, bytes: row.bytes, textLength: row.text.length },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ResumeUploadError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Resume upload failed:', error);
    return NextResponse.json({ error: 'The upload failed on the server. Try again.' }, { status: 500 });
  }
}
