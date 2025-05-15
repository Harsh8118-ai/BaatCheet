import { io } from 'socket.io-client';

// Create a socket instance
const socket = io("http://192.168.160.15:5000", {
  autoConnect: false, 
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;