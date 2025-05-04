"use client";

import React, { useState } from 'react';
import { useChallenge } from '@/contexts/ChallengeContext';
import { Button } from '@/components/ui/button';

export default function TestChallengePage() {
  const { sendChallenge } = useChallenge();
  const [challengedId, setChallengedId] = useState('');

  const handleSendChallenge = () => {
    if (challengedId) {
      sendChallenge(challengedId);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test Challenge System</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Challenged User ID:
          </label>
          <input
            type="text"
            value={challengedId}
            onChange={(e) => setChallengedId(e.target.value)}
            className="w-full p-2 border rounded-md bg-white text-black"
            placeholder="Enter user ID to challenge"
          />
        </div>

        <Button
          onClick={handleSendChallenge}
          disabled={!challengedId}
        >
          Send Challenge
        </Button>
      </div>
    </div>
  );
} 