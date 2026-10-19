import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, unauthorized } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  if (!(await getSessionUser())) return unauthorized();

  try {
    const { id } = await params;
    const existing = await prisma.project.findUnique({ where: { id }, select: { githubId: true } });
    if (existing?.githubId) {
      // The hourly GitHub sync would overwrite the edit
      return NextResponse.json(
        { error: 'This project is mirrored from GitHub. Edit its description on GitHub instead.' },
        { status: 409 }
      );
    }
    const body = await req.json();
    const { title, description, downloadUrl, externalUrl } = body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        downloadUrl: downloadUrl !== undefined ? downloadUrl : undefined,
        externalUrl: externalUrl !== undefined ? externalUrl : undefined,
      },
    });

    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  if (!(await getSessionUser())) return unauthorized();

  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({ where: { id }, select: { githubId: true } });
    if (project?.githubId) {
      return NextResponse.json(
        { error: 'This project is mirrored from GitHub. Remove the "portfolio" topic on GitHub to hide it.' },
        { status: 409 }
      );
    }
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Project deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
