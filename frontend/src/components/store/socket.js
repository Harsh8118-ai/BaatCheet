import { io } from 'socket.io-client';
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

// Create a socket instance
const socket = io(`${SOCKET_URL}`, {
  transports: ["websocket"], 
  withCredentials: true,     
  autoConnect: false, 
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;