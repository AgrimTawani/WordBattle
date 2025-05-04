"use client";

import React from 'react';
import { useChallenge } from '@/contexts/ChallengeContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ChallengeNotificationProps {
  gameId: string;
  challengerId: string;
  onClose: () => void;
}

export function ChallengeNotification({ gameId, challengerId, onClose }: ChallengeNotificationProps) {
  const { acceptChallenge, rejectChallenge } = useChallenge();

  const handleAccept = () => {
    acceptChallenge(gameId);
    onClose();
  };

  const handleReject = () => {
    rejectChallenge(gameId);
    onClose();
  };

  return (
    <Card className="p-4 bg-white shadow-lg rounded-lg">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Game Challenge</h3>
        <p>You have been challenged to a game!</p>
        <div className="flex gap-2">
          <Button
            onClick={handleAccept}
            className="bg-green-500 hover:bg-green-600"
          >
            Accept
          </Button>
          <Button
            onClick={handleReject}
            className="bg-red-500 hover:bg-red-600"
          >
            Reject
          </Button>
        </div>
      </div>
    </Card>
  );
} 