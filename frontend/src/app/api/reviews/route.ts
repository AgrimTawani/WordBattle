import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/reviews - fetch all reviews sorted by upvotes desc
export async function GET() {
  const reviews = await prisma.review.findMany({
    orderBy: { upvotes: 'desc' },
  });
  return NextResponse.json(reviews);
}

// POST /api/reviews - add a new review
export async function POST(req: NextRequest) {
  const { owner, review } = await req.json();
  if (!review || typeof review !== 'string') {
    return NextResponse.json({ error: 'Review is required' }, { status: 400 });
  }
  const newReview = await prisma.review.create({
    data: {
      owner: owner && owner.trim() ? owner.trim() : 'Anonymous',
      review: review.trim(),
    },
  });
  return NextResponse.json(newReview);
} 