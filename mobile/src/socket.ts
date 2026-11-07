import { io, Socket } from 'socket.io-client';
import { getToken } from './api';

const base = (process.env.EXPO_PUBLIC_WS_URL as string) || (process.env.EXPO_PUBLIC_API_URL as string) || 'http://localhost:3000';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export async function connectSocket(): Promise<Socket> {
  if (socket && socket.connected) return socket;
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  const token = await getToken();
  socket = io(base, {
    auth: { token: token ?? '' },
    transports: ['websocket', 'polling'],
    reconnection: true,
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}