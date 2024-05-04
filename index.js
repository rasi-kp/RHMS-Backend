// index.js
const express = require('express');
const dotenv = require('dotenv');
var logger = require('morgan');
const bodyParser = require('body-parser');
var cors = require('cors')
const socket = require('socket.io');
const path = require('path'); // Import path module


const main = require('./routes/main');
const admin = require("./routes/admin")
const user = require("./routes/users")
const patient = require("./routes/patients")
const doctor = require("./routes/doctors");
const Doctor = require('./model/doctor');
const Chat = require('./model/chats')
const User = require('./model/user')
require('./config/database');

dotenv.config();
const app = express();
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));
// Use routes
app.use('/', main);
app.use('/patient', patient);
app.use('/user', user);
app.use('/doctor', doctor);
app.use('/admin', admin);

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3001",
    credentials: true,
  },
});

// Map to keep track of each user's socket connection
const userSocketMap = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join room based on sender and receiver IDs
  socket.on('joinRoom', (data) => {
    const { senderId, receiverId } = data;

    // Track the sender's socket connection in the map
    userSocketMap.set(senderId, socket);

    // Log information about the room connection
    console.log(`Socket ${socket.id} joined room for senderId ${senderId} and receiverId ${receiverId}`);
  });

  // Handle sending a chat message
  socket.on('message', async (data) => {
    const { senderId, receiverId, message } = data;

    // Create a new chat message in the database
    const newChat = await Chat.create({
        senderId,
        receiverId,
        message,
        timestamp: new Date(),
    });

    // Check if the receiver's socket connection exists in the map
    const receiverSocket = userSocketMap.get(receiverId);

    // If the receiver's socket exists, emit the new chat message to the receiver only
    if (receiverSocket) {
        receiverSocket.emit('receive_message', newChat);
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { senderId, receiverId } = data;

    // Check if the receiver's socket connection exists in the map
    const receiverSocket = userSocketMap.get(receiverId);

    // If the receiver's socket exists, notify the receiver that the sender is typing
    if (receiverSocket) {
        receiverSocket.emit('user_typing', { senderId });
    }
  });

  // Handle user disconnects
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    for (const [key, value] of userSocketMap) {
      if (value === socket) {
        // Remove the disconnected user's socket from the map
        userSocketMap.delete(key);
        break;
      }
    }
  });
});
