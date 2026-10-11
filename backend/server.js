const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hubvibe';
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully');
  })
  .catch(err => {
    console.warn('MongoDB connection offline. Running in local fallback mode.');
  });

// Auth & Subscription API Routes
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  res.status(200).json({ 
    message: 'Registered successfully', 
    user: { name, email, role: 'FreeMember', isSubscribed: false } 
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  res.status(200).json({ 
    token: 'hubvibe_jwt_token_secure', 
    user: { name: email.split('@')[0], email, role: 'FreeMember', isSubscribed: false } 
  });
});

app.post('/api/auth/subscribe', (req, res) => {
  const { email } = req.body;
  res.status(200).json({ 
    message: 'Subscribed successfully', 
    user: { name: email.split('@')[0], email, role: 'ProMember', isSubscribed: true } 
  });
});

// Socket.io Real-Time Chat & Room Broadcasting
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on('send_message', (data) => {
    // Room ke baaki sabhi connected users ko message broadcast karega
    socket.to(data.room).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`HubVibe Server running on port ${PORT}`);
});