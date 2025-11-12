import { io } from 'socket.io-client';

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
const socket = io(SERVER, {
  reconnectionDelayMax: 10000,
  reconnection: true,
  reconnectionAttempts: 10,
  transports: ['websocket', 'polling']
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

socket.on('connect', () => {
  console.log('Connected to server');
});

export default socket;
