"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChallengeSocket } from '@/hooks/useChallengeSocket';
import { useUser } from '@clerk/nextjs';

interface Challenge {
  gameId: string;
  challengerId: string;
  status: 'waiting' | 'accepted' | 'rejected';
}

interface ChallengeContextType {
  sendChallenge: (challengedId: string) => void;
  acceptChallenge: (gameId: string) => void;
  rejectChallenge: (gameId: string) => void;
  cancelChallenge: (gameId: string) => void;
  pendingChallenges: Challenge[];
  isWaitingForOpponent: boolean;
}

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined);

export function ChallengeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const socket = useChallengeSocket();
  const { user } = useUser();
  const [pendingChallenges, setPendingChallenges] = useState<Challenge[]>([]);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);

  useEffect(() => {
    if (!socket || !user) {
      console.log('Socket or user not available:', { socket: !!socket, user: !!user });
      return;
    }

    console.log('Setting up socket listeners for user:', user.id);

    // Join user's room
    socket.emit('joinUserRoom', user.id);
    console.log('Emitted joinUserRoom event');

    // Listen for challenge events
    socket.on('challengeSent', (data: { gameId: string; status: string }) => {
      console.log('Challenge sent:', data);
      if (data.status === 'waiting') {
        setIsWaitingForOpponent(true);
        // Store game ID and navigate to waiting page
        sessionStorage.setItem('currentGameId', data.gameId);
        router.replace(`/game/${data.gameId}/waiting`);
      }
    });

    socket.on('opponentJoined', (data: { gameId: string }) => {
      console.log('Opponent joined:', data);
      setIsWaitingForOpponent(false);
      // Navigate to game page
      router.replace(`/game/${data.gameId}`);
    });

    socket.on('challengeReceived', (data: { gameId: string; challengerId: string }) => {
      console.log('Challenge received:', data);
      setPendingChallenges(prev => [...prev, { ...data, status: 'waiting' }]);
    });

    socket.on('challengeAccepted', (data: { gameId: string }) => {
      console.log('Challenge accepted:', data);
      setPendingChallenges(prev => 
        prev.map(challenge => 
          challenge.gameId === data.gameId 
            ? { ...challenge, status: 'accepted' }
            : challenge
        )
      );
    });

    socket.on('challengeRejected', (data: { gameId: string }) => {
      console.log('Challenge rejected:', data);
      setPendingChallenges(prev => 
        prev.map(challenge => 
          challenge.gameId === data.gameId 
            ? { ...challenge, status: 'rejected' }
            : challenge
        )
      );
    });

    socket.on('challengeCancelled', (data: { gameId: string }) => {
      console.log('Challenge cancelled:', data);
      setIsWaitingForOpponent(false);
      setPendingChallenges(prev => 
        prev.filter(challenge => challenge.gameId !== data.gameId)
      );
      router.push('/dashboard');
    });

    socket.on('challengeTimeout', (data: { gameId: string }) => {
      console.log('Challenge timed out:', data);
      setIsWaitingForOpponent(false);
      setPendingChallenges(prev => 
        prev.filter(challenge => challenge.gameId !== data.gameId)
      );
      router.push('/dashboard');
    });

    return () => {
      console.log('Cleaning up socket listeners');
      socket.off('challengeSent');
      socket.off('opponentJoined');
      socket.off('challengeReceived');
      socket.off('challengeAccepted');
      socket.off('challengeRejected');
      socket.off('challengeCancelled');
      socket.off('challengeTimeout');
    };
  }, [socket, user, router]);

  const sendChallenge = (challengedId: string) => {
    if (!socket || !user) {
      console.error('Cannot send challenge: socket or user not available');
      return;
    }
    console.log('Sending challenge:', { challengerId: user.id, challengedId });
    socket.emit('sendChallenge', {
      challengerId: user.id,
      challengedId
    });
  };

  const acceptChallenge = (gameId: string) => {
    if (!socket || !user) {
      console.error('Cannot accept challenge: socket or user not available');
      return;
    }
    console.log('Accepting challenge:', { gameId, userId: user.id });
    socket.emit('acceptChallenge', {
      gameId,
      userId: user.id
    });
    // Store game ID and navigate to game page
    sessionStorage.setItem('currentGameId', gameId);
    router.replace(`/game/${gameId}`);
  };

  const rejectChallenge = (gameId: string) => {
    if (!socket) {
      console.error('Cannot reject challenge: socket not available');
      return;
    }
    console.log('Rejecting challenge:', { gameId });
    socket.emit('rejectChallenge', { gameId });
    setPendingChallenges(prev => 
      prev.filter(challenge => challenge.gameId !== gameId)
    );
  };

  const cancelChallenge = (gameId: string) => {
    if (!socket) {
      console.error('Cannot cancel challenge: socket not available');
      return;
    }
    console.log('Cancelling challenge:', { gameId });
    socket.emit('cancelChallenge', { gameId });
    setIsWaitingForOpponent(false);
    router.push('/dashboard');
  };

  return (
    <ChallengeContext.Provider
      value={{
        sendChallenge,
        acceptChallenge,
        rejectChallenge,
        cancelChallenge,
        pendingChallenges,
        isWaitingForOpponent
      }}
    >
      {children}
    </ChallengeContext.Provider>
  );
}

export function useChallenge() {
  const context = useContext(ChallengeContext);
  if (context === undefined) {
    throw new Error('useChallenge must be used within a ChallengeProvider');
  }
  return context;
} 