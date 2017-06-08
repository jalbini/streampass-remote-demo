

var init = function() {
  createRoom();
  showIntro();
};










var showIntro = function() {
  slideUp($('#instructions'), 500);
}

var showQuizBackground = function() {
  $("#bg-splash").removeClass('hidden');

}










var slideUp = function($element, delay) {
  if (delay > 0) {
    setTimeout(slideUp, delay, $element, 0);
    return;
  }

  $element.addClass('animated slideInUp').removeClass('hidden');
}

var createRoom = function() {
  var socket = io();
  var n = nunchuck.init('host', socket);
  var players = {};
  var numPlayers = 1234;

  n.onJoin(function(data){

    if (!players[data.username]){
      players[data.username] = numPlayers;
      numPlayers+=1;
      createPlane(players[data.username]);
      $('.users').append("<br><strong>" + data.username + "</strong>")
    }

    n.receive(function(data){
      if (players[data.username]){
        data.id = players[data.username];
        movePlane(data)
      }
    })
  });
};



$(document).ready(function(){
  init();
});






