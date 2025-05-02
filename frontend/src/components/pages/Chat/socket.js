import { io } from 'socket.io-client';

// Create a socket instance
const socket = io("http://192.168.254.15:5000", {
  autoConnect: false, // Don't connect automatically
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;