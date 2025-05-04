import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const { userId } = await auth();
    console.log('Rush API GET called, userId:', userId);
    if (!userId) return NextResponse.json({ highscore: 0 });
    let rush = await prisma.rush.findUnique({ where: { userId } });
    if (!rush) {
      console.log('No rush found, creating new entry for userId:', userId);
      rush = await prisma.rush.create({ data: { userId, highscore: 0 } });
      console.log('Created rush entry:', rush);
    }
    return NextResponse.json({ highscore: rush.highscore });
  } catch (e) {
    console.error('Rush API error:', e);
    return NextResponse.json({ highscore: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ highscore: 0 });
    const { score } = await req.json();
    let rush = await prisma.rush.findUnique({ where: { userId } });
    if (!rush) {
      rush = await prisma.rush.create({ data: { userId, highscore: score ?? 0 } });
      return NextResponse.json({ highscore: score ?? 0 });
    }
    if (score > rush.highscore) {
      rush = await prisma.rush.update({ where: { userId }, data: { highscore: score } });
    }
    return NextResponse.json({ highscore: rush.highscore });
  } catch (e) {
    return NextResponse.json({ highscore: 0 });
  }
} 