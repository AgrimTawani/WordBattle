"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTileColors = getTileColors;
function getTileColors(guess, word) {
    let green = 0, yellow = 0;
    const wordArr = word.toUpperCase().split('');
    const guessArr = guess.toUpperCase().split('');
    const used = Array(wordArr.length).fill(false);
    // First pass: green
    for (let i = 0; i < guessArr.length; i++) {
        if (guessArr[i] === wordArr[i]) {
            green++;
            used[i] = true;
        }
    }
    // Second pass: yellow
    for (let i = 0; i < guessArr.length; i++) {
        if (guessArr[i] !== wordArr[i]) {
            const idx = wordArr.findIndex((ch, j) => ch === guessArr[i] && !used[j]);
            if (idx !== -1) {
                yellow++;
                used[idx] = true;
            }
        }
    }
    return { green, yellow };
}
