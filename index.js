const express = require('express');
const dotenv = require('dotenv');
var logger = require('morgan');
const bodyParser = require('body-parser');
var cors = require('cors')
const path = require('path'); // Import path module


const main = require('./routes/main');
const admin = require("./routes/admin")
const user = require("./routes/users")
const patient = require("./routes/patients")
const doctor = require("./routes/doctors");
const Chat = require('./model/chats')
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
const userSocketMap = new Map();

io.on('connection', (socket) => {
  // console.log('New client connected:', socket.id);

  socket.on('joinRoom', (data) => {
    const { senderId, receiverId } = data;
    userSocketMap.set(senderId, socket);
    // console.log(`Socket ${socket.id} joined room for senderId ${senderId} and receiverId ${receiverId}`);
    userSocketMap.set(senderId, socket);
    const receiverSocket = userSocketMap.get(receiverId);
    if(receiverSocket){
      io.emit('user_status', { status: 'online' });
    }
  });
  socket.on('message', async (data) => {
    const { senderId, receiverId, message } = data;
    const newChat = await Chat.create({
        senderId,
        receiverId,
        message,
        timestamp: new Date(),
    });
    const receiverSocket = userSocketMap.get(receiverId);
    if (receiverSocket) {
        receiverSocket.emit('receive_message', newChat);
    }
  });
  socket.on('typing', (data) => {
    const { senderId, receiverId } = data;
    const receiverSocket = userSocketMap.get(receiverId);
    if (receiverSocket) {
        receiverSocket.emit('user_typing', { senderId });
    }
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    for (const [userId, userSocket] of userSocketMap.entries()) {
      if (userSocket.id === socket.id) {
        userSocketMap.delete(userId);
        io.emit('user_status', { userId, status: 'offline' });
        break;
      }
    }
  });
});
