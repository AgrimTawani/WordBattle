import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getRandomWord } from '../utils/words';
import { io } from '../socket';

const router = Router();
const prisma = new PrismaClient();

// Create a game challenge
router.post('/challenge', async (req: Request, res: Response) => {
  try {
    const { userId, friendId, mode = 'classic' } = req.body;

    if (!userId || !friendId) {
      return res.status(400).json({ error: 'User ID and Friend ID are required' });
    }

    // Check if users are friends
    const friendship = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId: userId, friendId: friendId },
          { userId: friendId, friendId: userId }
        ]
      }
    });

    if (!friendship) {
      return res.status(400).json({ error: 'Users are not friends' });
    }

    // Check for existing pending challenge
    const existingChallenge = await prisma.gameChallenge.findFirst({
      where: {
        OR: [
          { challengerId: userId, challengedId: friendId },
          { challengerId: friendId, challengedId: userId }
        ],
        status: 'pending'
      }
    });

    if (existingChallenge) {
      return res.status(400).json({ error: 'A pending challenge already exists' });
    }

    // Create a challenge
    const challenge = await prisma.gameChallenge.create({
      data: {
        challengerId: userId,
        challengedId: friendId,
        mode,
        status: 'pending'
      }
    });

    // Notify challenged user through socket
    io.to(friendId).emit('gameChallenge', {
      challengeId: challenge.id,
      challenger: {
        id: userId
      },
      mode
    });

    res.json({ challengeId: challenge.id });
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ error: 'Failed to create challenge' });
  }
});

// Accept a game challenge
router.post('/challenge/:id/accept', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const challenge = await prisma.gameChallenge.findUnique({
      where: { id },
      include: {
        challenger: true,
        challenged: true
      }
    });

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    if (challenge.challengedId !== userId) {
      return res.status(403).json({ error: 'Not authorized to accept this challenge' });
    }

    if (challenge.status !== 'pending') {
      return res.status(400).json({ error: 'Challenge is no longer pending' });
    }

    // Update challenge status
    await prisma.gameChallenge.update({
      where: { id },
      data: { status: 'accepted' }
    });

    // Create a new game
    const word = await getRandomWord();
    const game = await prisma.game.create({
      data: {
        word,
        status: 'active',
        mode: challenge.mode,
        players: {
          connect: [
            { clerkId: challenge.challengerId },
            { clerkId: challenge.challengedId }
          ]
        }
      }
    });

    // Notify both players through socket
    io.to(challenge.challengerId).emit('challengeAccepted', {
      challengeId: id,
      gameId: game.id,
      mode: challenge.mode
    });

    io.to(challenge.challengedId).emit('challengeAccepted', {
      challengeId: id,
      gameId: game.id,
      mode: challenge.mode
    });

    res.json({ gameId: game.id });
  } catch (error) {
    console.error('Error accepting challenge:', error);
    res.status(500).json({ error: 'Failed to accept challenge' });
  }
});

// Reject a game challenge
router.post('/challenge/:id/reject', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const challenge = await prisma.gameChallenge.findUnique({
      where: { id }
    });

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    if (challenge.challengedId !== userId) {
      return res.status(403).json({ error: 'Not authorized to reject this challenge' });
    }

    if (challenge.status !== 'pending') {
      return res.status(400).json({ error: 'Challenge is no longer pending' });
    }

    // Update challenge status
    await prisma.gameChallenge.update({
      where: { id },
      data: { status: 'rejected' }
    });

    // Notify challenger through socket
    io.to(challenge.challengerId).emit('challengeRejected', {
      challengeId: id
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error rejecting challenge:', error);
    res.status(500).json({ error: 'Failed to reject challenge' });
  }
});

export default router; 