"use client";

import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

export const useMatchmakingSocket = () => {
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const initSocket = async () => {
      try {
        const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000', {
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

        socketRef.current = newSocket;
      } catch (error) {
        console.error('Socket initialization error:', error);
      }
    };

    initSocket();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []); // Empty dependency array

  return socketRef.current;
}; 