
var name = "";
const port = process.env.PORT || 5000;;
const socket_url = "https://gupshupp.herokuapp.com:"+port;

var socket = "";

$(function(){

  handleButtonEvents();

});

function initialize() {
  $('#prompt_name_container').show();
  $('#message_container').hide();
}

function clearText() {
  $('#input_message').val('');
}

function showChatScreen() {
  $('#prompt_name_container').hide();
  $('#message_container').show();
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

function createSocketConnection() {

    socket = io(socket_url);

    socket.on('message', function(data){

      console.log("# sender : "+data.sender);
      console.log("# message : "+data.text);

      postToChat(data.sender, data.text);
      clearText();
    });

    socket.on('online', function(data){

      showChatScreen()
      console.log("# ONLINE "+data.text);
      postToChat(data.sender, data.text);
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
}

function join() {
  if($('#input_name').val().trim().length == 0) {
    alert('Enter Your Name');
  }
  else {
    name = $('#input_name').val().trim();

    createSocketConnection()
    publish('authentication', {username:name});
  }

}

function publish(eventName, obj) {
  socket.emit(eventName, obj);
}

function postToChat(sender, message) {
  var completeText = '<span class="name">' + sender + '</span>'+"  "+message;
  $('#messages').append($('<li>').html(completeText));

}

function leave() {
  name = "";
  socket = "";
  console.log("Logout");
  initialize();
}
