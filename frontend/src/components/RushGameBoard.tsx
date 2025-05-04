"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;
const RUSH_TIME = 180; // 3 minutes

// Initial fallback words in case API fails
const FALLBACK_WORDS = [
  "apple"];


// Unique 5-letter words
  
function getRandomWord(words: string[]) {
  return words[Math.floor(Math.random() * words.length)].toUpperCase();
}

function getLetterStatus(guess: string, word: string) {
  // Returns an array of 'green', 'yellow', 'gray' for each letter
  const result = Array(WORD_LENGTH).fill("gray");
  const wordArr = word.split("");
  const guessArr = guess.split("");
  const used = Array(WORD_LENGTH).fill(false);
  // Green pass
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessArr[i] === wordArr[i]) {
      result[i] = "green";
      used[i] = true;
    }
  }
  // Yellow pass
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === "green") continue;
    const idx = wordArr.findIndex((ch, j) => ch === guessArr[i] && !used[j]);
    if (idx !== -1) {
      result[i] = "yellow";
      used[idx] = true;
    }
  }
  return result;
}

export default function RushGameBoard() {
  const router = useRouter();
  const [words, setWords] = useState<string[]>(FALLBACK_WORDS);
  const [targetWord, setTargetWord] = useState(getRandomWord(FALLBACK_WORDS));
  const [attempts, setAttempts] = useState<string[]>(Array(MAX_ATTEMPTS).fill(""));
  const [colors, setColors] = useState<string[][]>(Array(MAX_ATTEMPTS).fill(Array(WORD_LENGTH).fill("bg-white")));
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [currentAttempt, setCurrentAttempt] = useState<string[]>(Array(WORD_LENGTH).fill(""));
  const [gameStatus, setGameStatus] = useState<"playing" | "over">("playing");
  const [timer, setTimer] = useState(RUSH_TIME);
  const [score, setScore] = useState(0);
  const [highscore, setHighscore] = useState<number | null>(null);
  const [showStartModal, setShowStartModal] = useState(true);
  const [startCountdown, setStartCountdown] = useState(5);
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  // Fetch words from API
  useEffect(() => {
    const fetchWords = async () => {
      try {
        // Using Datamuse API to get 5-letter words
        const response = await fetch('https://api.datamuse.com/words?sp=?????&max=100');
        if (!response.ok) {
          throw new Error(`Failed to fetch words: ${response.status}`);
        }
        const data = await response.json();
        console.log('Raw API response:', data); // Log raw API response
        
        const fiveLetterWords = data
          .map((item: { word: string }) => item.word.toLowerCase())
          .filter((word: string) => word.length === 5 && /^[a-z]+$/.test(word));
        
        console.log('Filtered 5-letter words:', fiveLetterWords); // Log filtered words
        console.log('Number of 5-letter words:', fiveLetterWords.length); // Log count
        
        if (fiveLetterWords.length > 0) {
          console.log('Setting new words. First 5 words:', fiveLetterWords.slice(0, 5)); // Log first 5 words
          setWords(fiveLetterWords);
          const newTargetWord = getRandomWord(fiveLetterWords);
          console.log('New target word:', newTargetWord); // Log the new target word
          setTargetWord(newTargetWord);
        } else {
          throw new Error('No valid 5-letter words found');
        }
      } catch (error) {
        console.error('Error fetching words:', error);
        // Keep using fallback words if API fails
      }
    };

    fetchWords();
  }, []);

  // Fetch highscore on mount (but don't show it)
  useEffect(() => {
    fetch("/api/rush/highscore")
      .then(res => res.json())
      .then(data => {
        if (typeof data.highscore === 'number') {
          setHighscore(data.highscore);
        } else {
          fetch("/api/rush/highscore", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ score: 0 })
          })
            .then(res => res.json())
            .then(data => setHighscore(data.highscore));
        }
      });
  }, []);

  // Start modal countdown
  useEffect(() => {
    if (!showStartModal) return;
    if (startCountdown === 0) {
      setShowStartModal(false);
      return;
    }
    const interval = setInterval(() => setStartCountdown((c) => c - 1), 1000);
    return () => clearInterval(interval);
  }, [showStartModal, startCountdown]);

  // Timer logic (only run when modal is gone)
  useEffect(() => {
    if (showStartModal || gameStatus !== "playing") return;
    if (timer === 0) {
      setGameStatus("over");
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, gameStatus, showStartModal]);

  // Update highscore if needed when game ends
  useEffect(() => {
    if (gameStatus === "over" && highscore !== null && score > highscore) {
      fetch("/api/rush/highscore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score })
      })
        .then(res => res.json())
        .then(data => setHighscore(data.highscore));
    }
  }, [gameStatus, score, highscore]);

  // Board reset for new word
  const resetBoard = () => {
    setAttempts(Array(MAX_ATTEMPTS).fill(""));
    setColors(Array(MAX_ATTEMPTS).fill(Array(WORD_LENGTH).fill("bg-white")));
    setCurrentRow(0);
    setCurrentCol(0);
    setCurrentAttempt(Array(WORD_LENGTH).fill(""));
    setTargetWord(getRandomWord(words));
  };

  // Handle input change
  const handleInputChange = (rowIndex: number, colIndex: number, value: string) => {
    if (gameStatus !== "playing" || rowIndex !== currentRow) return;
    const newValue = value.slice(-1).toUpperCase();
    const newAttempt = [...currentAttempt];
    newAttempt[colIndex] = newValue;
    setCurrentAttempt(newAttempt);
    if (newValue && colIndex < WORD_LENGTH - 1) {
      setCurrentCol(colIndex + 1);
      inputRefs.current[rowIndex][colIndex + 1]?.focus();
    }
  };

  // Handle key down
  const handleKeyDown = (rowIndex: number, colIndex: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (gameStatus !== "playing" || rowIndex !== currentRow) return;
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
      if (currentAttempt.every((letter) => letter) && currentAttempt.length === WORD_LENGTH) {
        const guess = currentAttempt.join("");
        // Check win
        if (guess === targetWord) {
          // Update attempts/colors
          const newAttempts = [...attempts];
          newAttempts[currentRow] = guess;
          setAttempts(newAttempts);
          const newColors = [...colors];
          newColors[currentRow] = getLetterStatus(guess, targetWord).map((status) =>
            status === "green" ? "bg-green-500" : status === "yellow" ? "bg-yellow-500" : "bg-gray-500"
          );
          setColors(newColors);
          setScore((s) => s + 1);
          // Reset board for next word
          setTimeout(() => {
            resetBoard();
          }, 1000);
        } else {
          // Update attempts/colors
          const newAttempts = [...attempts];
          newAttempts[currentRow] = guess;
          setAttempts(newAttempts);
          const newColors = [...colors];
          newColors[currentRow] = getLetterStatus(guess, targetWord).map((status) =>
            status === "green" ? "bg-green-500" : status === "yellow" ? "bg-yellow-500" : "bg-gray-500"
          );
          setColors(newColors);
          if (currentRow + 1 < MAX_ATTEMPTS) {
            setCurrentRow(currentRow + 1);
            setCurrentCol(0);
            setCurrentAttempt(Array(WORD_LENGTH).fill(""));
            setTimeout(() => {
              inputRefs.current[currentRow + 1]?.[0]?.focus();
            }, 100);
          } else {
            // Out of attempts, reset board for next word
            setTimeout(() => {
              resetBoard();
            }, 1000);
          }
        }
      }
    } else if (e.key === "ArrowLeft" && colIndex > 0) {
      setCurrentCol(colIndex - 1);
      inputRefs.current[rowIndex][colIndex - 1]?.focus();
    } else if (e.key === "ArrowRight" && colIndex < WORD_LENGTH - 1) {
      setCurrentCol(colIndex + 1);
      inputRefs.current[rowIndex][colIndex + 1]?.focus();
    }
  };

  // Focus first input on mount
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.[0]?.focus();
    }, 100);
  }, []);

  // Board setup on board reset
  useEffect(() => {
    inputRefs.current = Array(MAX_ATTEMPTS)
      .fill(null)
      .map(() => Array(WORD_LENGTH).fill(null));
  }, [targetWord]);

  // Timer formatting
  const formatTime = (t: number) => `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, "0")}`;

  // Play again
  const handlePlayAgain = () => {
    setScore(0);
    setTimer(RUSH_TIME);
    resetBoard();
    setGameStatus("playing");
  };

  // Go home
  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] bg-zinc-900 flex-col items-center justify-center p-24">
      {showStartModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-gray-900 rounded-lg p-8 shadow-lg flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-2">Starting in...</h2>
            <div className="text-5xl font-mono font-bold">{startCountdown}</div>
          </div>
        </div>
      )}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Rush Mode (5x6)</h1>
        <div className="mb-2 text-xl text-white">Time Left: {formatTime(timer)}</div>
        <div className="mb-2 text-lg text-white">Score: {score}</div>
        <div className={`grid grid-rows-${MAX_ATTEMPTS} gap-2 mb-8`}>
          {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-2">
              {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
                let letter = "";
                if (rowIndex < currentRow) {
                  letter = attempts[rowIndex]?.[colIndex] || "";
                } else if (rowIndex === currentRow) {
                  letter = currentAttempt[colIndex];
                }
                const isCurrentRow = rowIndex === currentRow;
                const isCompleted = rowIndex < currentRow;
                return (
                  <div key={colIndex} className="relative">
                    <input
                      ref={(el) => {
                        if (inputRefs.current) {
                          if (!inputRefs.current[rowIndex]) {
                            inputRefs.current[rowIndex] = [];
                          }
                          inputRefs.current[rowIndex][colIndex] = el;
                        }
                      }}
                      type="text"
                      maxLength={1}
                      value={(letter || "").toUpperCase()}
                      onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(rowIndex, colIndex, e)}
                      disabled={gameStatus !== "playing" || !isCurrentRow || showStartModal}
                      className={`w-12 h-12 border-2 border-gray-300 text-center text-2xl font-bold outline-none ${
                        isCompleted
                          ? `text-white ${colors[rowIndex]?.[colIndex]}`
                          : "bg-white text-black"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {gameStatus === "over" && (
          <div className="flex flex-col items-center gap-2 mt-4">
            <div className="text-2xl font-bold text-white">Final Score: {score}</div>
            <button
              onClick={handlePlayAgain}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Play Again
            </button>
            <button
              onClick={handleGoHome}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Go Home
            </button>
          </div>
        )}
      </div>
    </main>
  );
} 