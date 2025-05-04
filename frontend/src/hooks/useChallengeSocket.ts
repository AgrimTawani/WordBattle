"use client";

import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import socketIOClient from 'socket.io-client';

export const useChallengeSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const initSocket = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
        console.log('Connecting to backend at:', backendUrl);
        
        const newSocket = socketIOClient(backendUrl, {
          path: '/socket.io',
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000,
          autoConnect: true,
          forceNew: true,
          withCredentials: true
        });

        newSocket.on('connect', () => {
          console.log('Connected to challenge server with ID:', newSocket.id);
        });

        newSocket.on('connect_error', (error: Error) => {
          console.error('Socket connection error:', error.message);
        });

        newSocket.on('disconnect', (reason: string) => {
          console.log('Disconnected from challenge server:', reason);
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
        console.log('Disconnecting socket...');
        socket.disconnect();
      }
    };
  }, []);

  return socket;
}; 