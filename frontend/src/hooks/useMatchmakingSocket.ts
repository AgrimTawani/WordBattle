"use client";

import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export const useMatchmakingSocket = () => {
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socketRef.current) {
      // Initialize socket connection
      const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000', {
        path: '/socket.io',
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      newSocket.on('connect', () => {
        console.log('Connected to matchmaking server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from matchmaking server');
        setIsConnected(false);
      });

      newSocket.on('error', (error: Error) => {
        console.error('Socket error:', error);
        setIsConnected(false);
      });

      socketRef.current = newSocket;
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, []); // Empty dependency array

  return { socket: socketRef.current, isConnected };
}; 