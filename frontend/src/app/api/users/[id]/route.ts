import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

// Create a single PrismaClient instance with connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// GET /api/users/[id] - get user data
export async function GET(req: NextRequest, context: any) {
  try {
    const { id } = context.params;
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const requestedId = req.url.split('/').pop();
    if (!requestedId) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Validate that the requested user ID matches the authenticated user
    if (userId !== requestedId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        games: {
          include: {
            winner: {
              select: { clerkId: true }
            }
          }
        },
        wonGames: true,
        rush: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/users/[id] - update user data
export async function PUT(req: NextRequest, context: any) {
  try {
    const { id } = context.params;
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const requestedId = req.url.split('/').pop();
    if (!requestedId) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Validate that the requested user ID matches the authenticated user
    if (userId !== requestedId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: { email },
      create: {
        clerkId: userId,
        email,
        wins: 0
      },
      include: {
        games: {
          include: {
            winner: {
              select: { clerkId: true }
            }
          }
        },
        wonGames: true,
        rush: true
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 