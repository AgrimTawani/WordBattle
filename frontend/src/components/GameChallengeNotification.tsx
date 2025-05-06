"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface GameChallengeNotificationProps {
  challengerId: string;
  challengerEmail: string;
  gameId: string;
}

export default function GameChallengeNotification({
  challengerId,
  challengerEmail,
  gameId
}: GameChallengeNotificationProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  const handleAccept = async () => {
    try {
      const response = await fetch('/api/game/challenge/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gameId, challengerId })
      });

      if (response.ok) {
        setIsVisible(false);
        router.push(`/game/${gameId}`);
      } else {
        toast.error('Failed to accept challenge');
      }
    } catch (error) {
      console.error('Error accepting challenge:', error);
      toast.error('Failed to accept challenge');
    }
  };

  const handleReject = async () => {
    try {
      const response = await fetch('/api/game/challenge/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gameId, challengerId })
      });

      if (response.ok) {
        setIsVisible(false);
        toast.success('Challenge rejected');
      } else {
        toast.error('Failed to reject challenge');
      }
    } catch (error) {
      console.error('Error rejecting challenge:', error);
      toast.error('Failed to reject challenge');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700">
      <h3 className="text-lg font-semibold mb-2">Game Challenge</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-4">
        {challengerEmail} has challenged you to a game!
      </p>
      <div className="flex gap-2">
        <Button
          variant="primary"
          onClick={handleAccept}
          className="bg-green-600 hover:bg-green-700"
        >
          Accept
        </Button>
        <Button
          variant="outline"
          onClick={handleReject}
          className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          Reject
        </Button>
      </div>
    </div>
  );
} 