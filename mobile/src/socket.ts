import { io, Socket } from 'socket.io-client';

const base = (process.env.EXPO_PUBLIC_WS_URL as string) || (process.env.EXPO_PUBLIC_API_URL as string) || 'http://10.0.2.2:3000';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(token: string): Socket {
  if (socket && socket.connected) return socket;
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  socket = io(base, {
    auth: { token },
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