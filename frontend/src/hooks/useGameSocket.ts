"use client";

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const useGameSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const initSocket = async () => {
      try {
        socketRef.current = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000', {
          path: '/socket.io',
          transports: ['websocket']
        });

        socketRef.current.on('connect', () => {
          console.log('Connected to game server');
        });

        socketRef.current.on('disconnect', () => {
          console.log('Disconnected from game server');
        });

        socketRef.current.on('error', (error: Error) => {
          console.error('Socket error:', error);
        });
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
  }, []);

  return socketRef.current;
}; 