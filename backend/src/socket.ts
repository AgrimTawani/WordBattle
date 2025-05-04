import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const io = new Server({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user's personal room for notifications
  socket.on('joinUserRoom', ({ userId }) => {
    socket.join(userId);
  });

  // Join challenge room
  socket.on('joinChallenge', ({ challengeId }) => {
    socket.join(challengeId);
  });

  // Handle game challenge
  socket.on('challengeFriend', async ({ challengeId, challengerId, challengedId }) => {
    try {
      const challenge = await prisma.gameChallenge.findUnique({
        where: { id: challengeId },
        include: {
          challenger: true,
          challenged: true
        }
      });

      if (!challenge) return;

      // Notify challenged user
      io.to(challengedId).emit('gameChallenge', {
        challengeId,
        challenger: {
          id: challenge.challenger.id,
          email: challenge.challenger.email
        },
        mode: challenge.mode
      });

      // Notify challenger
      io.to(challengerId).emit('challengeSent', {
        challengeId,
        challenged: {
          id: challenge.challenged.id,
          email: challenge.challenged.email
        },
        mode: challenge.mode
      });
    } catch (error) {
      console.error('Error handling game challenge:', error);
    }
  });

  // ... existing socket handlers ...
}); 