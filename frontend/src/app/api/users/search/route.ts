import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) return NextResponse.json({ users: [] });

    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: query,
          mode: 'insensitive'
        },
        NOT: {
          clerkId: userId // Exclude current user
        }
      },
      select: {
        email: true,
        clerkId: true,
        wins: true,
        createdAt: true
      },
      take: 5 // Limit to 5 results
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 