"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const gameSocket_1 = require("./sockets/gameSocket");
const matchmakingSocket_1 = require("./sockets/matchmakingSocket");
const challengeSocket_1 = require("./sockets/challengeSocket");
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});
const prisma = new client_1.PrismaClient();
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
app.use(express_1.default.json());
const waitingPlayers = [];
const activeGames = new Map();
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
    }
    catch (error) {
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
        const gamesWithClerkIds = await Promise.all(games.map(async (game) => {
            if (!game.winnerId)
                return game;
            const winner = await prisma.user.findUnique({
                where: { id: game.winnerId },
                select: { clerkId: true }
            });
            return {
                ...game,
                winnerId: (winner === null || winner === void 0 ? void 0 : winner.clerkId) || null
            };
        }));
        res.json({ games: gamesWithClerkIds });
    }
    catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Register socket handlers
(0, matchmakingSocket_1.registerMatchmakingSocket)(io);
(0, gameSocket_1.registerGameSocket)(io);
(0, challengeSocket_1.registerChallengeSocket)(io);
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
