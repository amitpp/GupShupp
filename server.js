const express = require('express');
const path = require('path');
var app = express();
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);
const port = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname,'public')));

activeUsers = [];

// Esatblish Connection with Clients
io.sockets.on('connection', function(socket){

  // This method will be called, first
  activeUsers.push(socket);
  console.log("Connected Socket Clients : %s",activeUsers.length);
  io.sockets.emit('activeUsers', {text: activeUsers.length, sender: 'Admin'});

  // Disconnect
  socket.on('disconnect', function(){
    activeUsers.splice(activeUsers.indexOf(socket), 1);
    console.log("Disconnect: Remaining Clients %s", activeUsers.length);
    io.sockets.emit('activeUsers', {text: activeUsers.length, sender: 'Admin'});

    io.sockets.emit('MESSAGE', {text: socket.username+" has left chat.", sender: 'Admin'});
  });

  // Subscriber : Getting Data
  socket.on('message', function(data){

    io.sockets.emit('message', {
      text: data.text,
      sender: data.sender
    });
  });

  // isTyping
  socket.on('isTyping', function(data){

    io.sockets.emit('isTyping', {
      sender: data.name,
      message: data.text
    });
  });

  socket.on('authentication', function(user){

    console.log("Got request of user : "+user.username);
    //io.sockets.emit('message', {text: user.username+" is online.", sender: 'Bot'});
    io.sockets.emit('online', {text: user.username+" is online.", sender: 'Bot'});
  });

  socket.on('DISCONNECT_USER', function(user){

  });

});

http.listen(port, function(){
  console.log("Server running at "+port);
});
