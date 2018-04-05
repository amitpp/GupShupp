const express = require('express');
const path = require('path');
var app = express();
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);
const port = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname,'public')));

activeUsers = [];
userNames = [];

// Esatblish Connection with Clients
io.sockets.on('connection', function(socket){

  // This method will be called, first
  activeUsers.push(socket);
  console.log("Connected Socket Clients : %s",activeUsers.length);
  io.sockets.emit('activeUsers', {text: activeUsers.length, sender: 'Admin'});

  // Disconnect
  socket.on('disconnect', function(){
    
    activeUsers.splice(activeUsers.indexOf(socket), 1);
    userNames.splice(userNames.indexOf(socket.username), 1);

    console.log("Disconnect: Remaining Clients %s", activeUsers.length);
    
    io.sockets.emit('activeUsers', {text: activeUsers.length, sender: 'Admin', users:userNames});
    io.sockets.emit('message', {text: socket.username+" is offline.", sender: 'Bot'});
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

    socket.username = user.username;    
    console.log("Index : "+userNames.indexOf(user.username));

    if(userNames.indexOf(user.username) < 0){
      console.log("Added to Userlist :"+user.username);
      userNames.push(user.username);
    }

    io.sockets.emit('online', {text: user.username+" is online.", sender: 'Bot', users: userNames});
  });

});

http.listen(port, function(){
  console.log("Server running at "+port);
});

// Utils
function inList(object, list){
  if(list.indexOf(object) == -1){
    return false;
  }
  return true;
}