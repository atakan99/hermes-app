const express = require('express');
const path=require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);
const formatMessage = require('./models/message_model');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./services/users_service');
const PORT = 5500 || process.env.PORT; 
const botName = 'HERMES-APP';
  
const publicDirectoryPath1=path.join(path.resolve(__dirname, ".."),'public');


console.log(publicDirectoryPath1)
app.use(express.static(publicDirectoryPath1));

io.on('connection', (socket) => {
   

    socket.on('join-room', ({username, room})=>{

        const user= userJoin(socket.id, username, room);

        socket.join(user.room);

        socket.emit('message', formatMessage(botName, 'Welcome to hermes'))

        socket.broadcast
        .to(user.room)
        .emit('message', 
        formatMessage(botName, `${user.username} has joined the chat`))

        io.to(user.room).emit('room-users', {
            room: user.room,
            users: getRoomUsers(user.room),
        })
    })

 

    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
      });

     socket.on('disconnect', ()=>{
    const user = userLeave(socket.id);
    
    if (user) {
        io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`))

        io.to(user.room).emit('room-users', {
            room: user.room,
            users: getRoomUsers(user.room),
        })
    }

  
       
    })
});

server.listen(PORT, () => {
  console.log(`listening on *: ${PORT}`);
});

