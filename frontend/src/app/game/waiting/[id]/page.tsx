"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { useUser } from "@clerk/nextjs";

export default function WaitingRoom({ params }: { params: { id: string } }) {
  const router = useRouter();
  const socket = useSocket();
  const { user, isLoaded } = useUser();
  const [challengeStatus, setChallengeStatus] = useState<"waiting" | "accepted" | "rejected">("waiting");
  const [opponent, setOpponent] = useState<{ email: string } | null>(null);

  useEffect(() => {
    if (!socket || !user) return;

    // Join the challenge room
    socket.emit('joinChallenge', { challengeId: params.id });

    // Listen for challenge status updates
    socket.on('challengeStatus', ({ status, opponent }) => {
      setChallengeStatus(status);
      if (opponent) setOpponent(opponent);
    });

    // Listen for game start
    socket.on('gameStart', ({ gameId }) => {
      router.replace(`/game/${gameId}`);
    });

    return () => {
      socket.off('challengeStatus');
      socket.off('gameStart');
    };
  }, [socket, user, params.id, router]);

  if (!isLoaded) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] bg-zinc-900 flex-col items-center justify-center p-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">Loading...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] bg-zinc-900 flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Waiting for Response</h1>
        {opponent && (
          <p className="text-xl mb-4">
            Challenge sent to {opponent.email}
          </p>
        )}
        <div className="text-lg">
          {challengeStatus === "waiting" && (
            <p>Waiting for opponent to accept...</p>
          )}
          {challengeStatus === "accepted" && (
            <p>Challenge accepted! Starting game...</p>
          )}
          {challengeStatus === "rejected" && (
            <p>Challenge was rejected</p>
          )}
        </div>
      </div>
    </main>
  );
} 