import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function POST(req: NextRequest, context: any) {
  const { userId } = await auth();
  const { id } = context.params;
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  // Check if user already voted
  const existing = await prisma.reviewVote.findUnique({
    where: { userId_reviewId: { userId, reviewId: id } }
  });
  if (existing) {
    return NextResponse.json({ error: 'Already voted' }, { status: 400 });
  }

  // Create vote and increment downvotes
  await prisma.reviewVote.create({
    data: { userId, reviewId: id, type: 'downvote' }
  });
  const updated = await prisma.review.update({
    where: { id },
    data: { downvotes: { increment: 1 } }
  });
  return NextResponse.json(updated);
} 