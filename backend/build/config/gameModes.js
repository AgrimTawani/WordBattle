"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GAME_MODES = void 0;
exports.GAME_MODES = {
    classic: {
        name: "Classic",
        boardRows: 6,
        boardCols: 5,
        maxAttempts: 6,
        description: "Traditional 5x6 Wordle."
    },
    wordy: {
        name: "Wordy",
        boardRows: 6,
        boardCols: 6,
        maxAttempts: 6,
        description: "Extended 6x6 Wordle."
    },
    challenge: {
        name: "Challenge a Friend",
        boardRows: 6,
        boardCols: 5,
        maxAttempts: 6,
        description: "Direct match with friends (5x6)."
    },
    rush: {
        name: "Wordle Rush",
        boardRows: 6,
        boardCols: 5,
        maxAttempts: 6,
        description: "Speed mode (frontend only)."
    }
};
