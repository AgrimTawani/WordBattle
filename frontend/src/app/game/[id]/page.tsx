"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGameSocket } from "@/hooks/useGameSocket";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { use } from "react";

const MODES = {
  classic: {
    WORD_LENGTH: 5,
    MAX_ATTEMPTS: 6
  },
  wordy: {
    WORD_LENGTH: 6,
    MAX_ATTEMPTS: 6
  }
};

// Fallback word in case API fails
const FALLBACK_WORD = "APPLE";

async function getRandomWord() {
  try {
    // Using Datamuse API to get 5-letter words
    const response = await fetch('https://api.datamuse.com/words?sp=?????&max=1000');
    if (!response.ok) {
      throw new Error('Failed to fetch word');
    }
    
    const data = await response.json();
    console.log('API response:', data);
    
    // Filter for valid 5-letter words
    const fiveLetterWords = data
      .map((item: { word: string }) => item.word.toLowerCase())
      .filter((word: string) => 
        word.length === 5 && 
        /^[a-z]+$/.test(word) && 
        !word.includes('-') && 
        !word.includes(' ')
      );
    
    if (fiveLetterWords.length === 0) {
      throw new Error('No valid words found');
    }
    
    // Get a random word from the filtered list
    const randomWord = fiveLetterWords[Math.floor(Math.random() * fiveLetterWords.length)];
    console.log('Selected word:', randomWord);
    return randomWord.toUpperCase();
  } catch (error) {
    console.error('Error fetching word:', error);
    return FALLBACK_WORD;
  }
}

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const socket = useGameSocket();
  const { user, isLoaded } = useUser();
  const { id: gameId } = use(params);
  const [word, setWord] = useState<string>("");
  const [mode, setMode] = useState<"classic" | "wordy">("classic");
  const [gameStatus, setGameStatus] = useState<"waiting" | "playing" | "won" | "lost">("waiting");
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [currentAttempt, setCurrentAttempt] = useState<string[]>([]);
  const [attempts, setAttempts] = useState<string[]>([]);
  const [colors, setColors] = useState<string[][]>([]);
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  const WORD_LENGTH = MODES[mode].WORD_LENGTH;
  const MAX_ATTEMPTS = MODES[mode].MAX_ATTEMPTS;

  // Set random word for classic mode
  useEffect(() => {
    const fetchWord = async () => {
      if (mode === "classic") {
        const randomWord = await getRandomWord();
        console.log('Setting word:', randomWord);
        setWord(randomWord);
      }
    };
    fetchWord();
  }, [mode]);

  // Initialize input refs and arrays
  useEffect(() => {
    setCurrentAttempt(Array(WORD_LENGTH).fill(""));
    setAttempts(Array(MAX_ATTEMPTS).fill(""));
    setColors(Array(MAX_ATTEMPTS).fill(Array(WORD_LENGTH).fill("bg-white")));
    inputRefs.current = Array(MAX_ATTEMPTS).fill(null).map(() => Array(WORD_LENGTH).fill(null));
  }, [WORD_LENGTH, MAX_ATTEMPTS]);

  // Block input until user is loaded
  const inputDisabled = !isLoaded || !user || gameStatus !== "playing";

  useEffect(() => {
    console.log("[GamePage] Mounted");
    if (!socket || !user) {
      return;
    }

    // Join the game room
    console.log("[GamePage] Emitting joinGame", { gameId });
    socket.emit('joinGame', { gameId });

    socket.on("gameStart", ({ word: gameWord, mode: gameMode }: { word: string; mode: string }) => {
      console.log("[GamePage] Received gameStart", { word: gameWord, mode: gameMode });
      console.log("[GamePage] DEBUG: Received mode in gameStart:", gameMode);
      setWord(gameWord);
      setMode((gameMode && gameMode.toLowerCase() === "wordy") ? "wordy" : "classic");
      setGameStatus("playing");
      // Focus on the first input box when game starts
      setTimeout(() => {
        inputRefs.current[0]?.[0]?.focus();
      }, 100);
    });

    socket.on("gameOver", (result: { winner: string; word: string }) => {
      console.log("[GamePage] Received gameOver", result);
      setGameStatus(result.winner === user.id ? "won" : "lost");
      sessionStorage.setItem(`game_${gameId}_result`, JSON.stringify(result));
      console.log(`[GamePage] Navigating to /result/${gameId}`);
      router.replace(`/result/${gameId}`);
    });

    socket.on("guessResult", ({ guess, colors: colorArr, row }: { guess: string; colors: string[]; row: number }) => {
      setAttempts(prev => {
        const updated = [...prev];
        updated[row] = guess;
        return updated;
      });
      setColors(prev => {
        const updated = [...prev];
        updated[row] = colorArr;
        return updated;
      });
      setCurrentRow(row + 1);
      setCurrentCol(0);
      setCurrentAttempt(Array(MODES[mode].WORD_LENGTH).fill(""));
      setTimeout(() => {
        inputRefs.current[row + 1]?.[0]?.focus();
      }, 100);
    });

    return () => {
      socket.off("gameStart");
      socket.off("gameOver");
      socket.off("guessResult");
    };
  }, [socket, router, gameId, user, mode]);

  const handleInputChange = (rowIndex: number, colIndex: number, value: string) => {
    if (inputDisabled || rowIndex !== currentRow) return;
    const newValue = value.slice(-1).toLowerCase();
    const newAttempt = [...currentAttempt];
    newAttempt[colIndex] = newValue;
    setCurrentAttempt(newAttempt);
    if (newValue && colIndex < MODES[mode].WORD_LENGTH - 1) {
      setCurrentCol(colIndex + 1);
      inputRefs.current[rowIndex][colIndex + 1]?.focus();
    }
  };

  const handleKeyDown = (rowIndex: number, colIndex: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (inputDisabled || rowIndex !== currentRow) return;
    if (e.key === "Backspace") {
      e.preventDefault();
      if (colIndex > 0 && !currentAttempt[colIndex]) {
        const newAttempt = [...currentAttempt];
        newAttempt[colIndex - 1] = "";
        setCurrentAttempt(newAttempt);
        setCurrentCol(colIndex - 1);
        inputRefs.current[rowIndex][colIndex - 1]?.focus();
      } else {
        const newAttempt = [...currentAttempt];
        newAttempt[colIndex] = "";
        setCurrentAttempt(newAttempt);
      }
    } else if (e.key === "Enter") {
      if (
        currentAttempt.every(letter => letter) &&
        currentAttempt.length === MODES[mode].WORD_LENGTH &&
        user &&
        user.id
      ) {
        const guess = currentAttempt.join("");
        if (socket) {
          console.log("[GamePage] Emitting guess", { gameId, guess, playerId: user.id, user });
          socket.emit("guess", {
            gameId,
            guess,
            playerId: user.id
          });
        }
      } else {
        console.log("[GamePage] User or user.id missing or guess invalid", { user, currentAttempt });
        return;
      }
    } else if (e.key === "ArrowLeft" && colIndex > 0) {
      setCurrentCol(colIndex - 1);
      inputRefs.current[rowIndex][colIndex - 1]?.focus();
    } else if (e.key === "ArrowRight" && colIndex < MODES[mode].WORD_LENGTH - 1) {
      setCurrentCol(colIndex + 1);
      inputRefs.current[rowIndex][colIndex + 1]?.focus();
    }
  };

  const getLetterStatus = (letter: string, index: number, attempt: string) => {
    if (!word || !letter || !word[index]) return "bg-white";
    if (word[index].toLowerCase() === letter.toLowerCase()) {
      return "bg-green-500";
    }
    if (word.toLowerCase().includes(letter.toLowerCase())) {
      return "bg-yellow-500";
    }
    return "bg-gray-500";
  };

  if (!isLoaded) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">Loading...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] bg-zinc-900 flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">{mode === "wordy" ? "Wordy Game (6x6)" : "Wordle Game (5x6)"}</h1>
        <div className={`grid grid-rows-${MAX_ATTEMPTS} gap-2 mb-8`}>
          {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-2">
              {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
                const value = rowIndex === currentRow 
                  ? currentAttempt[colIndex] || ""
                  : attempts[rowIndex]?.[colIndex] || "";
                
                return (
                  <input
                    key={colIndex}
                    ref={(el: HTMLInputElement | null) => {
                      if (inputRefs.current[rowIndex]) {
                        inputRefs.current[rowIndex][colIndex] = el;
                      }
                    }}
                    type="text"
                    maxLength={1}
                    value={value}
                    onChange={e => handleInputChange(rowIndex, colIndex, e.target.value)}
                    onKeyDown={e => handleKeyDown(rowIndex, colIndex, e)}
                    disabled={inputDisabled || rowIndex !== currentRow}
                    className={`w-12 h-12 text-center text-black text-2xl font-bold uppercase border-2 rounded
                      ${rowIndex === currentRow ? 'border-blue-500' : 'border-gray-300'}
                      ${colors[rowIndex]?.[colIndex] || 'bg-white'}
                      ${inputDisabled ? 'opacity-50' : ''}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
} 