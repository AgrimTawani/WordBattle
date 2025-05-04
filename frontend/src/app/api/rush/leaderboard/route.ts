// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  // Get all rush highscores with user emails, sorted descending
  const entries = await prisma.rush.findMany({
    orderBy: { highscore: 'desc' },
    include: { user: { select: { email: true } } }
  });
  return NextResponse.json({
    entries: entries.map(e => ({
      userId: e.userId,
      highscore: e.highscore,
      email: e.user?.email || null
    }))
  });
} 