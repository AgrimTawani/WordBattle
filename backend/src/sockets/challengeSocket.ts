import { Server, Socket } from 'socket.io';
import { ChallengeService } from '../services/challengeService';
import { gameManager } from '../game/gameManager';

const CHALLENGE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// Fallback words in case API fails
const FALLBACK_WORDS = {
  5: "APPLE",
  6: "PLANET"
};

interface DatamuseResponse {
  word: string;
  score: number;
  tags: string[];
}

async function getRandomWord(length: number): Promise<string> {
  try {
    const response = await fetch(`https://api.datamuse.com/words?sp=${'?'.repeat(length)}&max=1000`);
    if (!response.ok) {
      throw new Error('Failed to fetch word');
    }
    
    const data = await response.json() as DatamuseResponse[];
    
    // Filter for valid words
    const validWords = data
      .map(item => item.word.toLowerCase())
      .filter(word => 
        word.length === length && 
        /^[a-z]+$/.test(word) && 
        !word.includes('-') && 
        !word.includes(' ')
      );
    
    if (validWords.length === 0) {
      throw new Error('No valid words found');
    }
    
    // Get a random word from the filtered list
    const randomWord = validWords[Math.floor(Math.random() * validWords.length)];
    console.log('Selected word:', randomWord);
    return randomWord.toUpperCase();
  } catch (error) {
    console.error('Error fetching word:', error);
    return FALLBACK_WORDS[length as keyof typeof FALLBACK_WORDS];
  }
}

export function registerChallengeSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    // Handle user joining their personal room
    socket.on('joinUserRoom', (userId: string) => {
      socket.join(`user_${userId}`);
      console.log(`[ChallengeSocket] User ${userId} joined their room`);
    });

    // Handle challenge creation
    socket.on('sendChallenge', async (data: { challengerId: string; challengedId: string }) => {
      try {
        console.log('[ChallengeSocket] Received challenge request:', data);
        const challenge = await ChallengeService.createChallenge(data.challengerId, data.challengedId);
        
        // Notify challenger
        io.to(`user_${data.challengerId}`).emit('challengeSent', {
          gameId: challenge.gameId,
          status: 'waiting'
        });

        // Notify challenged user
        io.to(`user_${data.challengedId}`).emit('challengeReceived', {
          gameId: challenge.gameId,
          challengerId: data.challengerId
        });

        // Set timeout for challenge
        setTimeout(async () => {
          try {
            const currentChallenge = await ChallengeService.getChallenge(challenge.gameId);
            if (currentChallenge && currentChallenge.status === 'waiting') {
              await ChallengeService.rejectChallenge(challenge.gameId);
              io.to(`user_${data.challengerId}`).emit('challengeTimeout', {
                gameId: challenge.gameId
              });
              io.to(`user_${data.challengedId}`).emit('challengeTimeout', {
                gameId: challenge.gameId
              });
            }
          } catch (error) {
            console.error('[ChallengeSocket] Error handling challenge timeout:', error);
          }
        }, CHALLENGE_TIMEOUT);

        console.log(`[ChallengeSocket] Challenge created with gameId: ${challenge.gameId}`);
      } catch (error) {
        console.error('[ChallengeSocket] Error creating challenge:', error);
        socket.emit('error', { message: 'Failed to create challenge' });
      }
    });

    // Handle challenge acceptance
    socket.on('acceptChallenge', async (data: { gameId: string; userId: string }) => {
      try {
        const challenge = await ChallengeService.acceptChallenge(data.gameId);
        
        // Get a random word for the game
        const word = await getRandomWord(5); // Challenge mode is always 5 letters
        
        // Create game room
        const gameRoom = `game_${data.gameId}`;
        const players = [challenge.challengerId, challenge.challengedId];
        
        // Create game instance
        gameManager.createGame(data.gameId, word, 'classic', players);

        // Join both players to game room
        players.forEach(playerId => {
          io.sockets.sockets.forEach(socket => {
            if (socket.rooms.has(`user_${playerId}`)) {
              socket.join(gameRoom);
            }
          });
        });

        // Notify challenger that opponent has joined
        io.to(`user_${challenge.challengerId}`).emit('opponentJoined', {
          gameId: data.gameId
        });

        // Notify both players to start the game
        io.to(gameRoom).emit('gameStart', {
          word,
          mode: 'classic'
        });

        console.log(`[ChallengeSocket] Challenge accepted, game started: ${data.gameId}`);
      } catch (error) {
        console.error('[ChallengeSocket] Error accepting challenge:', error);
        socket.emit('error', { message: 'Failed to accept challenge' });
      }
    });

    // Handle challenge rejection
    socket.on('rejectChallenge', async (data: { gameId: string }) => {
      try {
        const challenge = await ChallengeService.rejectChallenge(data.gameId);
        
        // Notify challenger
        io.to(`user_${challenge.challengerId}`).emit('challengeRejected', {
          gameId: data.gameId
        });

        console.log(`[ChallengeSocket] Challenge rejected: ${data.gameId}`);
      } catch (error) {
        console.error('[ChallengeSocket] Error rejecting challenge:', error);
        socket.emit('error', { message: 'Failed to reject challenge' });
      }
    });

    // Handle challenge cancellation
    socket.on('cancelChallenge', async (data: { gameId: string }) => {
      try {
        const challenge = await ChallengeService.rejectChallenge(data.gameId);
        
        // Notify both users
        io.to(`user_${challenge.challengerId}`).emit('challengeCancelled', {
          gameId: data.gameId
        });
        io.to(`user_${challenge.challengedId}`).emit('challengeCancelled', {
          gameId: data.gameId
        });

        console.log(`[ChallengeSocket] Challenge cancelled: ${data.gameId}`);
      } catch (error) {
        console.error('[ChallengeSocket] Error cancelling challenge:', error);
        socket.emit('error', { message: 'Failed to cancel challenge' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('[ChallengeSocket] User disconnected:', socket.id);
    });
  });
} 