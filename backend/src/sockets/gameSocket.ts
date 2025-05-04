import { Server, Socket } from 'socket.io';
import { gameManager } from '../game/gameManager';

export function registerGameSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    socket.on('joinGame', ({ gameId }) => {
      console.log(`[BACKEND] joinGame: socketId=${socket.id}, gameId=${gameId}`);
      const game = gameManager.getGame(gameId);
      socket.join(`game_${gameId}`);
      if (game && typeof game.word === 'string' && typeof game.mode === 'string') {
        socket.emit('gameStart', { word: game.word, mode: game.mode });
      } else {
        socket.emit('gameStart', { word: undefined, mode: undefined });
      }
    });

    socket.on('guess', async ({ gameId, playerId, guess }) => {
      console.log(`[BACKEND] guess: gameId=${gameId}, playerId=${playerId}, guess=${guess}`);
      const colors = gameManager.addGuess(gameId, playerId, guess);
      if (!colors) return;

      // Emit guessResult to the player
      const game = gameManager.getGame(gameId);
      const row = game ? game.guesses[playerId].length - 1 : 0;
      // Convert colors to an array of color codes for each letter
      const getColorArray = (guess, word) => {
        return guess.split('').map((letter, idx) => {
          if (word[idx].toLowerCase() === letter.toLowerCase()) return 'bg-green-500';
          if (word.toLowerCase().includes(letter.toLowerCase())) return 'bg-yellow-500';
          return 'bg-gray-500';
        });
      };
      io.to(socket.id).emit('guessResult', {
        guess,
        colors: getColorArray(guess, game.word),
        row
      });

      if (gameManager.checkWin(gameId, playerId, guess)) {
        gameManager.setWinner(gameId, playerId);
        console.log(`[BACKEND] gameOver: winner=${playerId}, word=${guess}, reason=guessed`);
        io.to(`game_${gameId}`).emit('gameOver', { winner: playerId, word: guess, reason: 'guessed' });
        // Persist game completion to the database
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        await prisma.game.update({
          where: { id: gameId },
          data: {
            status: 'completed',
            winner: { connect: { clerkId: playerId } },
            updatedAt: new Date()
          }
        });
        // Increment winner's wins
        if (playerId) {
          await prisma.user.update({
            where: { clerkId: playerId },
            data: { wins: { increment: 1 } }
          });
        }
        gameManager.endGame(gameId);
      } else if (gameManager.checkGameOver(gameId)) {
        const { winner, reason } = gameManager.determineWinner(gameId);
        console.log(`[BACKEND] gameOver: winner=${winner}, word=${gameManager.getGame(gameId)?.word}, reason=${reason}`);
        io.to(`game_${gameId}`).emit('gameOver', { winner, word: gameManager.getGame(gameId)?.word, reason });
        // Persist game completion to the database
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        await prisma.game.update({
          where: { id: gameId },
          data: {
            status: 'completed',
            winner: winner ? { connect: { clerkId: winner } } : undefined,
            updatedAt: new Date()
          }
        });
        // Increment winner's wins
        if (winner) {
          await prisma.user.update({
            where: { clerkId: winner },
            data: { wins: { increment: 1 } }
          });
        }
        gameManager.endGame(gameId);
      }
    });
  });
} 