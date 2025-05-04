"use client";

import React, { useState, useEffect } from 'react';
import { useChallenge } from '@/contexts/ChallengeContext';
import { ChallengeNotification } from './ChallengeNotification';

export function NotificationSystem() {
  const { pendingChallenges } = useChallenge();
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    gameId: string;
    challengerId: string;
  }>>([]);

  useEffect(() => {
    // Add new challenges to notifications
    pendingChallenges.forEach(challenge => {
      if (!notifications.find(n => n.gameId === challenge.gameId)) {
        setNotifications(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          gameId: challenge.gameId,
          challengerId: challenge.challengerId,
        }]);
      }
    });
  }, [pendingChallenges]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map(notification => (
        <ChallengeNotification
          key={notification.id}
          gameId={notification.gameId}
          challengerId={notification.challengerId}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
} 