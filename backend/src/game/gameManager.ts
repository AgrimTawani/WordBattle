import { getTileColors } from './wordleUtils';
import { tiebreaker } from './tiebreaker';
import { GAME_MODES } from '../config/gameModes';

type PlayerId = string;
type GameId = string;

interface PlayerGuess {
  guess: string;
  colors: { green: number; yellow: number };
}

interface GameState {
  id: GameId;
  word: string;
  mode: keyof typeof GAME_MODES;
  players: PlayerId[];
  guesses: Record<PlayerId, PlayerGuess[]>;
  maxAttempts: number;
  winnerId: PlayerId | null;
  status: 'active' | 'completed';
}

const activeGames = new Map<GameId, GameState>();

export const gameManager = {
  createGame: (id: GameId, word: string, mode: keyof typeof GAME_MODES, players: PlayerId[]) => {
    const { maxAttempts } = GAME_MODES[mode];
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

  getGame: (id: GameId) => activeGames.get(id),

  addGuess: (gameId: GameId, playerId: PlayerId, guess: string) => {
    const game = activeGames.get(gameId);
    if (!game || game.status !== 'active') return null;
    if (!game.guesses[playerId]) {
      console.error(`PlayerId ${playerId} not found in game.guesses for game ${gameId}`);
      return null;
    }
    const colors = getTileColors(guess, game.word);
    game.guesses[playerId].push({ guess, colors });
    return colors;
  },

  checkWin: (gameId: GameId, playerId: PlayerId, guess: string) => {
    const game = activeGames.get(gameId);
    if (!game) return false;
    return guess.toUpperCase() === game.word.toUpperCase();
  },

  checkGameOver: (gameId: GameId) => {
    const game = activeGames.get(gameId);
    if (!game) return false;
    return game.players.every(pid => game.guesses[pid].length >= game.maxAttempts);
  },

  determineWinner: (gameId: GameId) => {
    const game = activeGames.get(gameId);
    if (!game) return { winner: null, reason: 'not_found' };
    if (game.winnerId) return { winner: game.winnerId, reason: 'guessed' };
    const [p1, p2] = game.players;
    const result = tiebreaker(
      game.guesses[p1].map(g => g.colors),
      game.guesses[p2].map(g => g.colors)
    );
    if (result === 'player') return { winner: p1, reason: 'tiebreaker' };
    if (result === 'opponent') return { winner: p2, reason: 'tiebreaker' };
    return { winner: null, reason: 'tie' };
  },

  setWinner: (gameId: GameId, playerId: PlayerId) => {
    const game = activeGames.get(gameId);
    if (game) game.winnerId = playerId;
  },

  endGame: (gameId: GameId) => {
    activeGames.delete(gameId);
  }
}; 