"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallengeService = void 0;
const client_1 = require("@prisma/client");
const nanoid_1 = require("nanoid");
const prisma = new client_1.PrismaClient();
class ChallengeService {
    static async createChallenge(challengerId, challengedId) {
        const gameId = (0, nanoid_1.nanoid)(12);
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
    static async getChallenge(gameId) {
        return prisma.challenge.findUnique({
            where: { gameId }
        });
    }
    static async acceptChallenge(gameId) {
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
    static async rejectChallenge(gameId) {
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
    static async getPendingChallenges(userId) {
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
    static async getNotifications(userId) {
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
    static async markNotificationAsRead(notificationId) {
        return prisma.notification.update({
            where: { id: notificationId },
            data: { read: true }
        });
    }
}
exports.ChallengeService = ChallengeService;
