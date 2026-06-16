'use client';
// Singleton Socket.IO client + a tiny zustand store for connection state.
import { io } from 'socket.io-client';
import { create } from 'zustand';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io({
      path: '/socket.io',
      withCredentials: true,
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export const useSocketStore = create((set) => ({
  connected: false,
  setConnected: (connected) => set({ connected }),
}));
