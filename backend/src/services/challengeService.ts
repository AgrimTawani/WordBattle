import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

export class ChallengeService {
  static async createChallenge(challengerId: string, challengedId: string) {
    const gameId = nanoid(12);
    
    // Create challenge record
    const challenge = await prisma.challenge.create({
      data: {
        gameId,
        challengerId,
        challengedId,
        status: 'pending'
      }
    });

    // Create notification for challenged user
    await prisma.notification.create({
      data: {
        userId: challengedId,
        type: 'challenge',
        content: `You have been challenged to a game!`,
        read: false
      }
    });

    return challenge;
  }

  static async getChallenge(gameId: string) {
    return prisma.challenge.findUnique({
      where: { gameId }
    });
  }

  static async acceptChallenge(gameId: string) {
    // First get the challenge details
    const challenge = await prisma.challenge.findUnique({
      where: { gameId },
      include: {
        challenger: true,
        challenged: true
      }
    });

    if (!challenge) {
      throw new Error('Challenge not found');
    }

    // Create the game record
    const game = await prisma.game.create({
      data: {
        id: gameId,
        word: 'APPLE', // This will be the actual word in production
        status: 'active',
        mode: 'classic',
        players: {
          connect: [
            { clerkId: challenge.challengerId },
            { clerkId: challenge.challengedId }
          ]
        }
      }
    });

    // Update challenge status
    await prisma.challenge.update({
      where: { gameId },
      data: { status: 'accepted' }
    });

    // Create notification for challenger
    await prisma.notification.create({
      data: {
        userId: challenge.challengerId,
        type: 'challenge',
        content: `Your challenge has been accepted!`,
        read: false
      }
    });

    return challenge;
  }

  static async rejectChallenge(gameId: string) {
    const challenge = await prisma.challenge.update({
      where: { gameId },
      data: { status: 'rejected' }
    });

    // Create notification for challenger
    await prisma.notification.create({
      data: {
        userId: challenge.challengerId,
        type: 'challenge',
        content: `Your challenge has been rejected.`,
        read: false
      }
    });

    return challenge;
  }

  static async getPendingChallenges(userId: string) {
    return prisma.challenge.findMany({
      where: {
        challengedId: userId,
        status: 'pending'
      },
      include: {
        challenger: true
      }
    });
  }

  static async getNotifications(userId: string) {
    return prisma.notification.findMany({
      where: {
        userId,
        read: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  static async markNotificationAsRead(notificationId: string) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });
  }
} 