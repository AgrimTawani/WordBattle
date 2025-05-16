import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { registerGameSocket } from './sockets/gameSocket';
import { registerMatchmakingSocket } from './sockets/matchmakingSocket';
import { registerChallengeSocket } from './sockets/challengeSocket';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "https://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Game state
interface WaitingPlayer {
  socketId: string;
  userId: string;
  email: string;
}

const waitingPlayers: WaitingPlayer[] = [];
const activeGames: Map<string, { word: string; players: string[]; playerIds: Map<string, string> }> = new Map();

interface Game {
  id: string;
  word: string;
  winnerId: string | null;
  createdAt: Date;
}

// Routes
app.get('/home', (req, res) => {
  res.json({ message: 'Welcome to Wordle Multiplayer' });
});

app.get('/api/users/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        email: true,
        wins: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/games/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;
    
    // First get the user's Prisma ID
    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Then get all games where the user is a player
    const games = await prisma.game.findMany({
      where: {
        players: {
          some: {
            id: user.id
          }
        }
      },
      select: {
        id: true,
        word: true,
        winnerId: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Map the games to include the clerk ID for the winner
    const gamesWithClerkIds = await Promise.all(games.map(async (game: Game) => {
      if (!game.winnerId) return game;
      
      const winner = await prisma.user.findUnique({
        where: { id: game.winnerId },
        select: { clerkId: true }
      });

      return {
        ...game,
        winnerId: winner?.clerkId || null
      };
    }));

    res.json({ games: gamesWithClerkIds });
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register socket handlers
registerMatchmakingSocket(io);
registerGameSocket(io);
registerChallengeSocket(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 