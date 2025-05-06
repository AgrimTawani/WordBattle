import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

interface Friend {
  friend: {
    email: string;
    clerkId: string;
  };
}

// GET /api/friends - get user's friends
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        friends: {
          include: {
            friend: {
              select: {
                email: true,
                clerkId: true
              }
            }
          }
        }
      }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const friends = user.friends.map((f: Friend) => ({
      id: f.friend.clerkId,
      email: f.friend.email
    }));

    return NextResponse.json({ friends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/friends - send friend request
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    // Find the receiver
    const receiver = await prisma.user.findUnique({
      where: { email }
    });

    if (!receiver) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (receiver.clerkId === userId) return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 });

    // Check if they're already friends
    const existingFriendship = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId: userId, friendId: receiver.clerkId },
          { userId: receiver.clerkId, friendId: userId }
        ]
      }
    });

    if (existingFriendship) return NextResponse.json({ error: 'Already friends' }, { status: 400 });

    // Check if there's already a pending request
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: receiver.clerkId },
          { senderId: receiver.clerkId, receiverId: userId }
        ],
        status: 'pending'
      }
    });

    if (existingRequest) return NextResponse.json({ error: 'Friend request already exists' }, { status: 400 });

    // Create friend request
    const request = await prisma.friendRequest.create({
      data: {
        senderId: userId,
        receiverId: receiver.clerkId,
        status: 'pending'
      }
    });

    return NextResponse.json({ request });
  } catch (error) {
    console.error('Error sending friend request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 