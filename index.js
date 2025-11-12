const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Simple HTTP endpoints for debugging / health checks
app.get('/', (req, res) => {
  res.status(200).send({ message: 'Real-Time Analytics Dashboard server', port: PORT });
});

app.get('/health', (req, res) => {
  res.status(200).send({ status: 'ok', port: PORT, uptime: process.uptime() });
});

// Initial state
let state = {
  activeUsers: 10,
  totalVisits: 1000,
  totalSales: 5000,
  cpuUsage: 20,
  recentActivities: [],
  salesDistribution: {
    products: ['Electronics', 'Clothing', 'Food', 'Books', 'Others'],
    values: [1200, 900, 800, 600, 1500]
  }
};

// Control variables for simulator
let paused = false;
let intervalMs = 1000;
let intervalId = null;

// Socket connection
io.on('connection', (socket) => {
  console.log('Client connected', socket.id);

  // Admin controls via socket
  socket.on('control', (cmd) => {
    try {
      handleControlCommand(cmd, socket);
    } catch (err) {
      console.error('control handler error', err.message);
    }
  });

  socket.on('disconnect', () => console.log('Client disconnected', socket.id));
});

function emitMetrics() {
  io.emit('metrics', {
    activeUsers: state.activeUsers,
    totalVisits: state.totalVisits,
    totalSales: state.totalSales,
    cpuUsage: Number(state.cpuUsage.toFixed(1)),
    recentActivities: state.recentActivities,
    salesDistribution: state.salesDistribution
  });
}

// Simulate metrics update
function updateMetrics() {
  if (paused) return;

  // Update active users (random fluctuation)
  state.activeUsers = Math.max(0, state.activeUsers + Math.floor(Math.random() * 11) - 5);
  state.totalVisits += Math.floor(Math.random() * 3);

  // Simulate sales occasionally
  const newSale = Math.random() > 0.7 ? Math.floor(Math.random() * 500) + 10 : 0;
  if (newSale > 0) {
    state.totalSales += newSale;
    const category = Math.floor(Math.random() * state.salesDistribution.products.length);
    state.salesDistribution.values[category] += newSale;

    // Add to recent activities
    state.recentActivities.unshift({
      id: Date.now(),
      type: 'sale',
      amount: newSale,
      product: state.salesDistribution.products[category],
      timestamp: new Date().toISOString()
    });
    state.recentActivities = state.recentActivities.slice(0, 10); // Keep last 10
  }

  // Simulate CPU usage (realistic fluctuation)
  state.cpuUsage = Math.min(100, Math.max(0, state.cpuUsage + (Math.random() * 12 - 6)));

  emitMetrics();
}

function startInterval() {
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(updateMetrics, intervalMs);
}

function handleControlCommand(cmd, socket) {
  // cmd: { action: 'pause'|'resume'|'setInterval'|'manualSale', payload: any }
  if (!cmd || !cmd.action) return;
  const action = cmd.action;
  if (action === 'pause') {
    paused = true;
    socket.emit('control:ack', { success: true, paused });
  } else if (action === 'resume') {
    paused = false;
    socket.emit('control:ack', { success: true, paused });
  } else if (action === 'setInterval') {
    const ms = Number(cmd.payload) || 1000;
    intervalMs = Math.max(100, ms);
    startInterval();
    socket.emit('control:ack', { success: true, intervalMs });
  } else if (action === 'manualSale') {
    const amount = Number(cmd.payload) || (Math.floor(Math.random() * 300) + 20);
    state.totalSales += amount;
    const category = Math.floor(Math.random() * state.salesDistribution.products.length);
    state.salesDistribution.values[category] += amount;
    const activity = { id: Date.now(), type: 'sale', amount, product: state.salesDistribution.products[category], timestamp: new Date().toISOString() };
    state.recentActivities.unshift(activity);
    state.recentActivities = state.recentActivities.slice(0, 10);
    emitMetrics();
    socket.emit('control:ack', { success: true, injected: activity });
  }
}

// Start simulation loop
startInterval();

// Bind to 0.0.0.0 to accept connections from localhost and other interfaces
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT} (also available at http://localhost:${PORT})`);
});