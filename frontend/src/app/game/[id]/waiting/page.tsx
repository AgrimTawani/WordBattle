"use client";

import { useEffect } from 'react';
import { useChallenge } from '@/contexts/ChallengeContext';
import { useParams, useRouter } from 'next/navigation';

export default function WaitingPage() {
  const { isWaitingForOpponent, cancelChallenge } = useChallenge();
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;

  useEffect(() => {
    // If we're not waiting anymore, the opponent has joined
    if (!isWaitingForOpponent) {
      // The navigation will be handled by the ChallengeContext
      console.log('Opponent has joined, game will start soon...');
    }
  }, [isWaitingForOpponent]);

  const handleCancel = () => {
    cancelChallenge(gameId);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900">
      <div className="text-center p-8 rounded-lg bg-zinc-800 shadow-xl">
        <h1 className="text-4xl font-bold text-white mb-4">Waiting for Opponent</h1>
        <div className="flex justify-center mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
        <p className="text-gray-400 mb-2">Game ID: {gameId}</p>
        <p className="text-gray-400 mb-6">Share this ID with your friend to join</p>
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Cancel Challenge
        </button>
      </div>
    </div>
  );
} 