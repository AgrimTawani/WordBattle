"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMatchmakingSocket = registerMatchmakingSocket;
const client_1 = require("@prisma/client");
const gameManager_1 = require("../game/gameManager");
const nanoid_1 = require("nanoid");
const prisma = new client_1.PrismaClient();
const waitingPlayersByMode = {};
// Fallback words in case API fails
const FALLBACK_WORDS = {
    5: "APPLE",
    6: "PLANET"
};
async function getRandomWord(length) {
    try {
        const response = await fetch(`https://api.datamuse.com/words?sp=${'?'.repeat(length)}&max=1000`);
        if (!response.ok) {
            throw new Error('Failed to fetch word');
        }
        const data = await response.json();
        // Filter for valid words
        const validWords = data
            .map((item) => item.word.toLowerCase())
            .filter((word) => word.length === length &&
            /^[a-z]+$/.test(word) &&
            !word.includes('-') &&
            !word.includes(' '));
        if (validWords.length === 0) {
            throw new Error('No valid words found');
        }
        // Get a random word from the filtered list
        const randomWord = validWords[Math.floor(Math.random() * validWords.length)];
        console.log('Selected word:', randomWord);
        return randomWord.toUpperCase();
    }
    catch (error) {
        console.error('Error fetching word:', error);
        return FALLBACK_WORDS[length];
    }
}
function registerMatchmakingSocket(io) {
    io.on('connection', (socket) => {
        socket.on('findMatch', async (data) => {
            var _a, _b;
            const mode = data.mode || 'classic';
            if (!waitingPlayersByMode[mode])
                waitingPlayersByMode[mode] = [];
            waitingPlayersByMode[mode].push({
                socketId: socket.id,
                userId: data.userId,
                email: data.email
            });
            if (waitingPlayersByMode[mode].length >= 2) {
                const [player1, player2] = waitingPlayersByMode[mode].splice(0, 2);
                try {
                    console.log("[BACKEND] Upserting users:", player1.userId, player1.email, player2.userId, player2.email);
                    // Create or update users in the database
                    const [user1, user2] = await Promise.all([
                        prisma.user.upsert({
                            where: { clerkId: player1.userId },
                            update: {},
                            create: { clerkId: player1.userId, email: player1.email }
                        }),
                        prisma.user.upsert({
                            where: { clerkId: player2.userId },
                            update: {},
                            create: { clerkId: player2.userId, email: player2.email }
                        })
                    ]);
                    // Get a random word of the correct length for the mode
                    const wordLength = mode === 'wordy' ? 6 : 5;
                    const word = await getRandomWord(wordLength);
                    const gameId = (0, nanoid_1.nanoid)(12);
                    const players = [player1.userId, player2.userId];
                    // Create game in memory
                    gameManager_1.gameManager.createGame(gameId, word, mode, players);
                    // Persist game creation to the database
                    await prisma.game.create({
                        data: {
                            id: gameId,
                            word,
                            status: 'active',
                            mode,
                            players: {
                                connect: [
                                    { clerkId: player1.userId },
                                    { clerkId: player2.userId }
                                ]
                            }
                        }
                    });
                    // Create a room for the game
                    const gameRoom = `game_${gameId}`;
                    (_a = io.sockets.sockets.get(player1.socketId)) === null || _a === void 0 ? void 0 : _a.join(gameRoom);
                    (_b = io.sockets.sockets.get(player2.socketId)) === null || _b === void 0 ? void 0 : _b.join(gameRoom);
                    console.log(`[BACKEND] Matched ${player1.email} (${player1.userId}) with ${player2.email} (${player2.userId}). Game ID: ${gameId}, Mode: ${mode}`);
                    // Notify players that match is found
                    io.to(player1.socketId).emit('matchFound', {
                        gameId,
                        opponent: player2.email,
                        mode,
                        word,
                        players
                    });
                    io.to(player2.socketId).emit('matchFound', {
                        gameId,
                        opponent: player1.email,
                        mode,
                        word,
                        players
                    });
                    // Send game start event with the word and mode
                    console.log(`[BACKEND] Emitting gameStart to room ${gameRoom} with word=${word}, mode=${mode}`);
                    io.to(gameRoom).emit('gameStart', { word, mode });
                }
                catch (error) {
                    console.error("[BACKEND] Error creating game:", error);
                    io.to(player1.socketId).emit('error', { message: "Failed to create game" });
                    io.to(player2.socketId).emit('error', { message: "Failed to create game" });
                }
            }
        });
        socket.on('disconnect', () => {
            Object.keys(waitingPlayersByMode).forEach((mode) => {
                const index = waitingPlayersByMode[mode].findIndex((p) => p.socketId === socket.id);
                if (index > -1) {
                    waitingPlayersByMode[mode].splice(index, 1);
                }
            });
        });
    });
}
