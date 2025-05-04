"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

interface GameResult {
  winner: string;
  word: string;
}

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [result, setResult] = useState<GameResult | null>(null);

  useEffect(() => {
    console.log("[ResultPage] Mounted");
    if (!user) return;

    // Get the result from session storage
    const storedResult = sessionStorage.getItem(`game_${id}_result`);
    if (storedResult) {
      console.log("[ResultPage] Loaded result from sessionStorage", storedResult);
      setResult(JSON.parse(storedResult));
    } else {
      console.log("[ResultPage] No result found in sessionStorage for", `game_${id}_result`);
    }
  }, [user, id]);

  const handlePlayAgain = () => {
    console.log("[ResultPage] Play Again clicked, navigating to /findingUsers");
    router.push('/findingUsers');
  };

  const handleGoHome = () => {
    console.log("[ResultPage] Go Home clicked, navigating to /");
    router.push('/');
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

  if (!result) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">Game Result Not Found</h1>
          <Button onClick={handleGoHome}>Go Home</Button>
        </div>
      </main>
    );
  }

  const isWinner = result.winner === user?.id;

  return (
    <main className="flex min-h-[calc(100vh-4rem)] bg-zinc-900 flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">
          {isWinner ? "Congratulations! You Won!" : "Game Over"}
        </h1>
        
        <div className="mb-8">
          <p className="text-2xl mb-4">The word was: <span className="font-bold">{result.word}</span></p>
          <p className="text-xl">
            {isWinner 
              ? "You guessed the word correctly!" 
              : "Better luck next time!"}
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button onClick={handlePlayAgain} className="bg-green-500 hover:bg-green-600">
            Play Again
          </Button>
          <Button onClick={handleGoHome} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    </main>
  );
} 