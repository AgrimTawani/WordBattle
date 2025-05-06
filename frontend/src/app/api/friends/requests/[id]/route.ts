import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const requestId = params.id;
    if (!requestId) return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });

    // Get the friend request
    const request = await prisma.friendRequest.findUnique({ where: { id: requestId } });
    if (!request) return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
    if (request.receiverId !== userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (request.status !== 'pending') return NextResponse.json({ error: 'Request already processed' }, { status: 400 });

    // Update request status
    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'accepted' }
    });

    // Create friendship (bidirectional)
    await prisma.friend.createMany({
      data: [
        { userId: request.senderId, friendId: request.receiverId },
        { userId: request.receiverId, friendId: request.senderId }
      ],
      skipDuplicates: true
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to accept friend request' }, { status: 500 });
  }
} 