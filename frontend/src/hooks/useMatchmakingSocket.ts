"use client";

import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import socketIOClient from 'socket.io-client';

export const useMatchmakingSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const initSocket = async () => {
      try {
        const newSocket = socketIOClient(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000', {
          path: '/socket.io',
          transports: ['websocket']
        });

        newSocket.on('connect', () => {
          console.log('Connected to matchmaking server');
        });

        newSocket.on('disconnect', () => {
          console.log('Disconnected from matchmaking server');
        });

        newSocket.on('error', (error: Error) => {
          console.error('Socket error:', error);
        });

        setSocket(newSocket);
      } catch (error) {
        console.error('Socket initialization error:', error);
      }
    };

    initSocket();

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return socket;
}; 