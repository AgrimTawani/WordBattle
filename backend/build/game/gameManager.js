"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameManager = void 0;
const wordleUtils_1 = require("./wordleUtils");
const tiebreaker_1 = require("./tiebreaker");
const gameModes_1 = require("../config/gameModes");
const activeGames = new Map();
exports.gameManager = {
    createGame: (id, word, mode, players) => {
        const { maxAttempts } = gameModes_1.GAME_MODES[mode];
        activeGames.set(id, {
            id,
            word,
            mode,
            players,
            guesses: Object.fromEntries(players.map(pid => [pid, []])),
            maxAttempts,
            winnerId: null,
            status: 'active'
        });
    },
    getGame: (id) => activeGames.get(id),
    addGuess: (gameId, playerId, guess) => {
        const game = activeGames.get(gameId);
        if (!game || game.status !== 'active')
            return null;
        if (!game.guesses[playerId]) {
            console.error(`PlayerId ${playerId} not found in game.guesses for game ${gameId}`);
            return null;
        }
        const colors = (0, wordleUtils_1.getTileColors)(guess, game.word);
        game.guesses[playerId].push({ guess, colors });
        return colors;
    },
    checkWin: (gameId, playerId, guess) => {
        const game = activeGames.get(gameId);
        if (!game)
            return false;
        return guess.toUpperCase() === game.word.toUpperCase();
    },
    checkGameOver: (gameId) => {
        const game = activeGames.get(gameId);
        if (!game)
            return false;
        return game.players.every(pid => game.guesses[pid].length >= game.maxAttempts);
    },
    determineWinner: (gameId) => {
        const game = activeGames.get(gameId);
        if (!game)
            return { winner: null, reason: 'not_found' };
        if (game.winnerId)
            return { winner: game.winnerId, reason: 'guessed' };
        const [p1, p2] = game.players;
        const result = (0, tiebreaker_1.tiebreaker)(game.guesses[p1].map(g => g.colors), game.guesses[p2].map(g => g.colors));
        if (result === 'player')
            return { winner: p1, reason: 'tiebreaker' };
        if (result === 'opponent')
            return { winner: p2, reason: 'tiebreaker' };
        return { winner: null, reason: 'tie' };
    },
    setWinner: (gameId, playerId) => {
        const game = activeGames.get(gameId);
        if (game)
            game.winnerId = playerId;
    },
    endGame: (gameId) => {
        activeGames.delete(gameId);
    }
};
