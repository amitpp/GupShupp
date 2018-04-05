
var name = "";
var socket = "";
var previousOffsetValue = "";
var currentOffsetValue = "";

$(function(){

  handleButtonEvents();
  handleEnterButton();
  handleKeyPress();

  initialize();
});

function handleEnterButton() {

    $('input').keyup(function(event) {
      if (event.keyCode == 13) {

        if(this.id == "input_name"){
          join();
        }
        else if(this.id == "input_message") {
          send();
        }
      }

    });
}

function initialize() {
  $('#login-header-div').show();
  $('#footer-div-chat').hide();
  $('#online_users').hide();
}

function clearTyping() {
  $('#is_typing').html(' ');
}

function clearText() {
  $('#input_message').val('');
}


function showChatScreen() {
  $('#login-header-div').hide();
  $('#footer-div-chat').show();
  //$('#online_users').show();
}

function handleButtonEvents() {

  $('button').click(function(){

    if(this.id == 'btn_login'){
      join()
    }
    else if (this.id == 'btn_send') {
      send();
    }
    else if(this.id == 'btn_close') {
      leave();
    }

  });
}

function handleKeyPress(){

  $('#input_message').keyup(function(event) {
    
    if($('#input_message').val().length > 0) {
      isTyping();
    }
    else {
      clearTyping();
    }
  });
}

function createSocketConnection() {

    socket = io();

    socket.on('message', function(data){

      scrollScreen();

      if(name == data.sender){
        postToChat(data.sender, data.text, true);
      }
      else {
          postToChat(data.sender, data.text, false);
      }

    });

    socket.on('online', function(data){

      showChatScreen()

      console.log("Online :"+data.text);
      updateUserList(data);
      console.log("List of Users : "+data.users);
      
      postToChat(data.sender, data.text, false);
    });

    socket.on('isTyping', function(data){
      updateTypingText(data.message);
    });

    socket.on('activeUsers', function(data){

      console.log("Active Users :"+data.text);
      updateOnlineUsers(data.text);
      updateUserList(data);
    });

    socket.on('disconnect', function(user){

    });
}

function send() {

  console.log($('#input_message').val().trim().length);
  if($('#input_message').val().trim().length <= 0){
    return;
  }
  else {
    var message = $('#input_message').val();
    var obj = {sender: name, text: message};
    publish('message', obj);
  }

  clearText();
  clearTyping();
}

function isTyping() {
  var obj = {sender: name, text: name+" is typing..."};
  publish('isTyping', obj);
}

function join() {

  if($('#input_name').val().trim().length == 0) {
    alert('Enter Your Name');
  }
  else {
    name = $('#input_name').val().trim();
    createSocketConnection()
    name = capitalizeFirstLetter(name);
    publish('authentication', {username:name});
  }

}

function scrollScreen() {

  currentOffsetValue = $("#messages li").last().offset().top;  
  if(currentOffsetValue < previousOffsetValue) {
    currentOffsetValue = previousOffsetValue + 100;
  }
  
  if(currentOffsetValue == previousOffsetValue){
    currentOffsetValue = currentOffsetValue + 100;
  }

  previousOffsetValue = currentOffsetValue;

  $("#messages").stop().animate({
    scrollTop: currentOffsetValue
  }, '300', 'swing', function() {});
}

function updateOnlineUsers(count) {
  $('#chat_label').html("#common ("+count+' Online)');
}

function updateUserList(usersList) {

  for(var i = 0; i < usersList.users.length; i++){
      // Add User
      console.log("Username : "+users[i]);
    
      $('#online_users').append('<label class="list-group-item list-group-item-action">'+users[i]+'</label>');
  }
}

function updateTypingText(text) {
  $('#is_typing').html(text);
}

function publish(eventName, obj) {
  socket.emit(eventName, obj);
}

function postToChat(sender, message, isMe) {
  if(isMe == true) {
    //$('#messages').append($('<li class="text-right">').html(completeText).css('background-color', '#2ecc71').css('color','white').css('font-style', 'bold'));
    $('#messages').append($('<li class="text-right">').html('<div id="name">'+sender+'</div><br><span id="meMessage" class="text-right">'+message+'</span></li>'));
  }
  else {
    //var completeText = '<span class="name"><strong>' + sender + '</strong></span>'+":  "+message;
    //$('#messages').append($('<li>').html(completeText));

    $('#messages').append($('<li>').html('<div id="name">'+sender+'</div><br><span id="message">'+message+'</span></li>'));
  }

}

function leave() {
  name = "";
  socket = "";
  console.log("Logout");
  initialize();
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}