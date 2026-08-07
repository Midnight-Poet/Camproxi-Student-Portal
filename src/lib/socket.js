import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(`${import.meta.env.VITE_BACKEND_URL || window.location.origin}/chat`, {
      withCredentials: true, // sends the auth cookie your gateway reads
      autoConnect: false,
    });
  }
  return socket;
}