"use client";

import { Suspense, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMatchmakingSocket } from "@/hooks/useMatchmakingSocket";
import { useUser } from "@clerk/nextjs";
import SearchingTiles from "@/components/SearchingTiles";

function FindingUsersContent() {
  const router = useRouter();
  const { socket, isConnected } = useMatchmakingSocket();
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "classic";

  const initializeMatchmaking = useCallback(() => {
    if (!socket || !isConnected || !user || !isLoaded) {
      console.log("[FindingUsers] Not ready:", { 
        socket: !!socket, 
        isConnected, 
        user: !!user, 
        isLoaded 
      });
      return;
    }

    console.log("[FindingUsers] Initializing matchmaking:", {
      id: user.id,
      email: user.emailAddresses[0].emailAddress,
      mode
    });

    // Emit findMatch with user information and mode
    socket.emit("findMatch", {
      userId: user.id,
      email: user.emailAddresses[0].emailAddress,
      mode
    });
    console.log("[FindingUsers] Emitted findMatch event");
  }, [socket, isConnected, user, isLoaded, mode]);

  useEffect(() => {
    console.log("[FindingUsers] Mounted");
    initializeMatchmaking();
  }, [initializeMatchmaking]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleMatchFound = (data: { gameId: string; opponent: string }) => {
      console.log(`[FindingUsers] Match found with opponent: ${data.opponent}`);
      console.log("[FindingUsers] Game ID:", data.gameId);
      // Store game ID in session storage before navigation
      sessionStorage.setItem('currentGameId', data.gameId);
      // Use replace instead of push to prevent back navigation
      console.log(`[FindingUsers] Navigating to /game/${data.gameId}`);
      router.replace(`/game/${data.gameId}`);
    };

    socket.on("matchFound", handleMatchFound);

    return () => {
      console.log("[FindingUsers] Cleaning up socket listeners");
      socket.off("matchFound", handleMatchFound);
    };
  }, [socket, isConnected, router]);

  if (!isLoaded || !isConnected) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] bg-zinc-900 flex-col items-center justify-center p-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">
            {!isLoaded ? "Loading user..." : "Connecting to server..."}
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] bg-zinc-900 flex-col items-center justify-center p-24">
      <div className="text-center">
        <SearchingTiles />
      </div>
    </main>
  );
}

export default function FindingUsersPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-[calc(100vh-4rem)] bg-zinc-900 flex-col items-center justify-center p-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">Loading...</h1>
        </div>
      </main>
    }>
      <FindingUsersContent />
    </Suspense>
  );
} 