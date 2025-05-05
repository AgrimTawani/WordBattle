"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tiebreaker = tiebreaker;
function tiebreaker(playerStats, opponentStats) {
    const playerGreen = playerStats.reduce((sum, g) => sum + g.green, 0);
    const opponentGreen = opponentStats.reduce((sum, g) => sum + g.green, 0);
    if (playerGreen > opponentGreen)
        return 'player';
    if (opponentGreen > playerGreen)
        return 'opponent';
    const playerYellow = playerStats.reduce((sum, g) => sum + g.yellow, 0);
    const opponentYellow = opponentStats.reduce((sum, g) => sum + g.yellow, 0);
    if (playerYellow > opponentYellow)
        return 'player';
    if (opponentYellow > playerYellow)
        return 'opponent';
    return 'tie';
}
