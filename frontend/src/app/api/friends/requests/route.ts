import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// GET /api/friends/requests - get user's friend requests
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get all friend requests for the current user
    const friendRequests = await prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: 'pending'
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            clerkId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ requests: friendRequests });
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch friend requests' },
      { status: 500 }
    );
  }
}

// POST /api/friends/requests/:id/accept - accept friend request
export async function POST(req: NextRequest, context: any) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { id } = context.params;
    if (!id) return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });

    const request = await prisma.friendRequest.findUnique({
      where: { id }
    });

    if (!request) return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
    if (request.receiverId !== userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (request.status !== 'pending') return NextResponse.json({ error: 'Request already processed' }, { status: 400 });

    // Update request status
    await prisma.friendRequest.update({
      where: { id },
      data: { status: 'accepted' }
    });

    // Create friendship (bidirectional)
    await prisma.friend.createMany({
      data: [
        { userId: request.senderId, friendId: request.receiverId },
        { userId: request.receiverId, friendId: request.senderId }
      ]
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/friends/requests/:id - reject friend request
export async function DELETE(req: NextRequest, context: any) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { id } = context.params;
    if (!id) return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });

    const request = await prisma.friendRequest.findUnique({
      where: { id }
    });

    if (!request) return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
    if (request.receiverId !== userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (request.status !== 'pending') return NextResponse.json({ error: 'Request already processed' }, { status: 400 });

    // Update request status
    await prisma.friendRequest.update({
      where: { id },
      data: { status: 'rejected' }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 