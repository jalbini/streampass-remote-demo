var gameState = {
  started: false,
  players: []
};



var init = function() {
  createRoom();
  showIntro();
};










var showIntro = function() {
  fadeInUp($('#footer'), 1000);
  fastFadeInUp($('#instructions'), 2000);

}

var startGame = function() {
  gameState.started = true;

  $('#status-text').text('Starting in');
  $('#countdown').removeClass('hidden');

  $('#instructions').removeClass('fast-animated fadeInUp').addClass('fast-animated fadeOutUp');

  tickCountdown(5, showQuiz);
}

var tickCountdown = function(val, onComplete) {
  $('#countdown').text(val);

  if (val <= 0) {
    onComplete();
    return;
  }

  setTimeout(tickCountdown, 1000, val-1, onComplete);
}

var showQuiz = function() {
  $('#countdown').addClass('hidden');
  $('#status-text').text('BUZZ NOW!');

  $('#user-lobby').addClass('fast-animated fadeOutUp');
  $('#splash').addClass('animated slideOutLeft');

  setTimeout(function() {
    $('#bg-quiz').addClass('animated fadeIn').removeClass('invisible');
    $('#quiz').addClass('animated fadeInUp').removeClass('hidden');
    $('#user-scores').addClass('fast-animated fadeInUp').removeClass('hidden');
  }, 750)
};


var showQuizBackground = function() {
  $("#bg-splash").removeClass('hidden');

}









var fastFadeInUp = function($element, delay) {
  if (delay > 0) {
    setTimeout(fastFadeInUp, delay, $element, 0);
    return;
  }

  $element.addClass('fast-animated fadeInUp').removeClass('hidden');
}

var fadeInUp = function($element, delay) {
  if (delay > 0) {
    setTimeout(fadeInUp, delay, $element, 0);
    return;
  }

  $element.addClass('animated fadeInUp').removeClass('hidden');
}


var createRoom = function() {
  var socket = io();
  var n = nunchuck.init('host', socket);

  n.onJoin(onPlayerJoin);
  n.receive(onPlayerData);
};



var onPlayerJoin = function(data) {
  var userId = data.userId;
  var username = data.username;

  if (!getPlayerById(userId)) {
    addPlayer(userId, username);
  }
};

var onPlayerData = function(data) {
  var userId = data.userId;
  var player = getPlayerById(userId);

  if(!player)
    return;

  player.prevState = player.state;
  player.state = data;
  updatePlayerUI(player);

  // fire onPlayerReady
  if (playerReady(player) && (!player.prevState || !player.prevState.buttons.includes('ready'))) {
    onPlayerReady(player);
  }

};

var onPlayerReady = function(player) {
  if(!gameState.started && allPlayersReady()) {
      startGame();      
  }
};


/////////////
// HELPERS //
/////////////
var addPlayer = function(id, username) {
  var player = {
    id: id,
    username: username,
    state: null,
    prevState: null,
    score: 0,
    pnum: gameState.players.length + 1
  };

  gameState.players.push(player);
  updatePlayerUI(player);
}

var getPlayerById = function(id) {
  return gameState.players.find(
    (player) => player.id === id
  );
};

var playerCount = () => gameState.players.length;
var playerReady = player => player.state && player.state.buttons.includes("ready");
var playersReady = () => gameState.players.filter(playerReady).length;
var allPlayersReady = () => playersReady() === gameState.players.length;


var updatePlayerUI = function(player) {
  var suffix = '-p' + player.pnum.toString();

  $(`#ready${suffix}, #score${suffix}`).removeClass('invisible');
  $(`#ready${suffix} .username, #score${suffix} .username`).text(player.username);
  $(`#score${suffix} .score`).text(player.score);

  if(!gameState.started) {
    $('#status-text').text(`${playersReady()}/${playerCount()} players ready`);

    if (playerReady(player)) {
      $(`#ready${suffix}`).addClass('ready');
    } else {
      $(`#ready${suffix}`).removeClass('ready');
    }
  }
}

$(document).ready(function(){
  init();
});






