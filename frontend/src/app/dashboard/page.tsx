"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

interface Game {
  id: string;
  word: string;
  status: string;
  winnerId: string | null;
  winner?: { clerkId: string } | null;
  createdAt: string;
}

interface User {
  id: string;
  clerkId: string;
  email: string;
  wins: number;
  games: Game[];
  wonGames: Game[];
  rush?: {
    highscore: number;
  };
}

export default function DashboardPage() {
  const { user } = useUser();
  const [userData, setUserData] = useState<User | null>(null);
  const [stats, setStats] = useState({ total: 0, wins: 0 });
  const [rushHighscore, setRushHighscore] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;

    // Just fetch user data
    fetch(`/api/users/${user.id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch user data');
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          setUserData(data);
          setStats({
            total: data.games?.length || 0,
            wins: data.wins || 0
          });
          if (data.rush) {
            setRushHighscore(data.rush.highscore);
          }
        }
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
      });
  }, [user]);

  if (!user) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-zinc-900 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-2xl md:text-4xl font-extrabold font-serif text-white mb-8 tracking-wider">Please sign in to view your dashboard</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] w-screen bg-zinc-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-extrabold font-serif text-white mb-8 tracking-wider">Your Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8">
          {/* Game Statistics Card */}
          <div className="bg-zinc-800 p-4 md:p-6 rounded-lg shadow-md border border-zinc-700">
            <h2 className="text-xl md:text-2xl font-bold font-serif text-white mb-4">Game Statistics</h2>
            <div className="space-y-4 text-white font-serif">
              <div className="flex justify-between">
                <span>Total Games:</span>
                <span className="font-bold text-wordle-yellow">{stats.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Wins:</span>
                <span className="font-bold text-wordle-green">{stats.wins}</span>
              </div>
              <div className="flex justify-between">
                <span>Win Rate:</span>
                <span className="font-bold text-white">
                  {stats.total > 0
                    ? `${Math.round((stats.wins / stats.total) * 100)}%`
                    : "0%"}
                </span>
              </div>
            </div>
          </div>

          {/* Rush Highscore Card */}
          <div className="bg-zinc-800 p-4 md:p-6 rounded-lg shadow-md border border-zinc-700 flex flex-col justify-center items-center">
            <h2 className="text-xl md:text-2xl font-bold font-serif text-white mb-4">Rush Highscore</h2>
            <div className="text-4xl md:text-5xl font-mono font-bold text-yellow-300">
              {rushHighscore !== null ? rushHighscore : "—"}
            </div>
          </div>
        </div>

        {/* Recent Games Card */}
        <div className="bg-zinc-800 rounded-lg shadow-md border border-zinc-700">
          <div className="p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold font-serif text-white mb-4">Recent Games</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full font-serif text-white">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-2 px-4 md:px-6">Date</th>
                  <th className="text-left py-2 px-4 md:px-6">Word</th>
                  <th className="text-left py-2 px-4 md:px-6">Result</th>
                </tr>
              </thead>
              <tbody>
                {userData?.games?.slice().reverse().map((game) => {
                  const isWinner = game.winner && game.winner.clerkId === user.id;
                  return (
                    <tr key={game.id} className="border-b border-zinc-700">
                      <td className="py-2 px-4 md:px-6">{new Date(game.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 px-4 md:px-6">{game.word}</td>
                      <td className="py-2 px-4 md:px-6">
                        <span className={`font-bold ${isWinner ? "text-wordle-green" : "text-red-500"}`}>
                          {isWinner ? "Won" : "Lost"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
} 