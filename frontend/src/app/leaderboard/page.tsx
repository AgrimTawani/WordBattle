"use client";
import { useEffect, useState } from "react";

interface LeaderboardEntry {
  userId: string;
  highscore: number;
  email?: string;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("rush");

  useEffect(() => {
    fetch("/api/rush/leaderboard")
      .then(res => res.json())
      .then(data => {
        setEntries(data.entries || []);
        setLoading(false);
      });
  }, []);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] w-screen flex-col items-center p-4 md:p-8 bg-zinc-900 pt-8 md:pt-12">
      <div className="w-full max-w-2xl px-4">
        <h1 className="text-3xl md:text-4xl font-extrabold font-serif text-white mb-6 md:mb-8 tracking-wider text-center">Rush Leaderboard</h1>
        <div className="bg-zinc-800 p-4 md:p-6 rounded-lg shadow-md border border-zinc-700">
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="min-w-[400px] md:w-full p-4 md:p-0">
              <table className="w-full font-serif text-white">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left py-2 text-sm md:text-base">Rank</th>
                    <th className="text-left py-2 text-sm md:text-base">User</th>
                    <th className="text-left py-2 text-sm md:text-base">Highscore</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={3} className="text-center py-4 text-sm md:text-base">Loading...</td></tr>
                  ) : entries.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-4 text-sm md:text-base">No entries yet.</td></tr>
                  ) : (
                    entries.map((entry, idx) => (
                      <tr key={entry.userId} className="border-b border-zinc-700">
                        <td className="py-2 text-sm md:text-base">{idx + 1}</td>
                        <td className="py-2 text-sm md:text-base">{entry.email || entry.userId}</td>
                        <td className="py-2 font-bold text-yellow-300 text-sm md:text-base">{entry.highscore}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 