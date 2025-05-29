import { io } from 'socket.io-client';

// Create a socket instance
const socket = io("http://194.238.23.199:8000", {
  autoConnect: false, 
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;