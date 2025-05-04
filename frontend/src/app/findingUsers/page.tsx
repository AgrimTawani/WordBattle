"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMatchmakingSocket } from "@/hooks/useMatchmakingSocket";
import { useUser } from "@clerk/nextjs";
import SearchingTiles from "@/components/SearchingTiles";

export default function FindingUsersPage() {
  const router = useRouter();
  const socket = useMatchmakingSocket();
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "classic";

  useEffect(() => {
    console.log("[FindingUsers] Mounted");
    if (!socket || !user) {
      console.log("[FindingUsers] Socket or user not available:", { socket: !!socket, user: !!user });
      return;
    }

    console.log("[FindingUsers] User information:", {
      id: user.id,
      email: user.emailAddresses[0].emailAddress,
      mode
    });

    // Emit findMatch with user information and mode
    console.log("[FindingUsers] Emitting findMatch", { userId: user.id, email: user.emailAddresses[0].emailAddress, mode });
    socket.emit("findMatch", {
      userId: user.id,
      email: user.emailAddresses[0].emailAddress,
      mode
    });
    console.log("[FindingUsers] Emitted findMatch event");

    socket.on("matchFound", (data: { gameId: string; opponent: string }) => {
      console.log(`[FindingUsers] Match found with opponent: ${data.opponent}`);
      console.log("[FindingUsers] Game ID:", data.gameId);
      // Store game ID in session storage before navigation
      sessionStorage.setItem('currentGameId', data.gameId);
      // Use replace instead of push to prevent back navigation
      console.log(`[FindingUsers] Navigating to /game/${data.gameId}`);
      router.replace(`/game/${data.gameId}`);
    });

    return () => {
      console.log("[FindingUsers] Cleaning up socket listeners");
      socket.off("matchFound");
    };
  }, [socket, router, user, isLoaded, mode]);

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
        <SearchingTiles />
      </div>
    </main>
  );
} 