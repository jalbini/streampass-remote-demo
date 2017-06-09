var n;

var gameState = {
  started: false,
  players: [],
  questionNum: 1,
  openBuzzer: true,
  correctAnswer: 'answer-c',
  bounty: 100,
  answerTimeoutId: null
};

var questions = [
  {
    "question":"What mutant team is Logan part of?",
    "answers": [
      "Justice League",
      "X-Men",
      "Golden State Warriors"
    ],
    "correctAnswer": "answer-b",
    "bounty": 100
  },
  {
    "question":"What is Logan's superhero name?",
    "answers": [
      "Wolverine",
      "Wolverine",
      "It's Wolverine"
    ],
    "correctAnswer": "answer-a",
    "bounty": 50
  },
  {
    "question":"How tall is Wolverine in the comic books?",
    "answers": [
      "160.02cm",
      "160.03cm",
      "160.04cm"
    ],
    "correctAnswer": "answer-a",
    "bounty": 300
  }
]


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

  tickCountdown(3, showQuiz);
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

    gameState.players.map(
      (player) => n.setState(player.id, 'buzzer')
    );
  }, 750);
};


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
  n = nunchuck.init('host', socket);
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

  if (justPressed('buzz', player)) {
    onPlayerBuzz(player);
  }

  if (justPressed('answer-a', player)) {
    onPlayerAnswer(player, 'answer-a');
  }

  if (justPressed('answer-b', player)) {
    onPlayerAnswer(player, 'answer-b');
  }

  if (justPressed('answer-c', player)) {
    onPlayerAnswer(player, 'answer-c');
  }

};

var onPlayerReady = function(player) {
  if(!gameState.started) {
    if(allPlayersReady()) {
      startGame();
    }
  } else {
    n.setState(player.id, 'buzzer');
  }
};

var onPlayerBuzz = function(player) {
  if(gameState.openBuzzer) {
    gameState.openBuzzer = false;

    n.setState(player.id, 'answer-select', {
      currentScore: player.score,
      questionNumber: gameState.questionNum
    });

    gameState.answerTimeoutId = setTimeout(function(){
      player.score -= gameState.bounty;


      n.setState(player.id, 'result', {
        currentScore: player.score,
        result: 'out-of-time'
      });

      updatePlayerUI(player);
      updateStatus('OUT OF TIME!');

      setTimeout(resetBuzzers, 2000);
      setTimeout(updateStatus, 2000, 'BUZZ NOW!'); 
    }, 10000, player);

    var suffix = '-p' + player.pnum.toString();

    $('#status-text').text(`${player.username} is\nselecting`);
    $('.user-score').not('.invisible').not(`#score${suffix}`).addClass('faded');
  }
};

var onPlayerAnswer = function(player, answer) {
  if (gameState.answerTimeoutId) {
    clearTimeout(gameState.answerTimeoutId);
    gameState.answerTimeoutId = null;
  }

  if (answer === gameState.correctAnswer) {
    // change background color of answer
    $(`#${answer}`).addClass('correct');

    // 

    player.score += gameState.bounty;
    updatePlayerUI(player);

    n.setState(player.id, 'result', {
      currentScore: player.score,
      result: 'correct'
    });

    updateStatus('CORRECT!');
    setTimeout(nextQuestion, 3000);
  } else {
    $(`#${answer}`).addClass('wrong');

    player.score -= gameState.bounty;

    n.setState(player.id, 'result', {
      currentScore: player.score,
      result: 'wrong'
    });    

    updateStatus('WRONG!');
    setTimeout(resetBuzzers, 2000);
    setTimeout(updateStatus, 2000, 'BUZZ NOW!'); 
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

var resetBuzzers = () => {
    gameState.openBuzzer = true;
    $('.user-score').removeClass('faded');

    gameState.players.map(
      (player) => n.setState(player.id, 'buzzer')
    );
}

var justPressed =  (buttonName, player) => {
  return player.state 
    && player.state.buttons.includes(buttonName)
    && player.prevState
    && !player.prevState.buttons.includes(buttonName);
}

var updateStatus = (statusText) => {
  $('#status-text').stop();

  $('#status-text')
    .fadeOut(200)
    .queue( function(next) {
      $(this).text(statusText);
      next();
    })
    .delay(100)
    .fadeIn(350);
  // $('#status-text')

};

var nextQuestion = () => {
  // hide elements
    if (questions.length === 0) {
      showResult();
      return;
    }


  $('#main-content').fadeOut(300).queue(function(next){
    var nextQuestion = questions.shift();

    gameState.bounty = nextQuestion.bounty;
    gameState.correctAnswer = nextQuestion.correctAnswer;
    gameState.questionNum += 1;

    $('#bounty').text(`+${gameState.bounty} pts`);
    $('#question-text').text(nextQuestion.question);

    $('#answer-a').text(nextQuestion.answers[0]);
    $('#answer-b').text(nextQuestion.answers[1]);
    $('#answer-c').text(nextQuestion.answers[2]);

    $('.answer').removeClass('wrong').removeClass('correct');
    
    resetBuzzers();
    next();

  }).delay(100).fadeIn(350);
  updateStatus('BUZZ NOW!');


};

var showResult = () => {
  $('#footer').removeClass('fadeInUp').addClass('fadeOutDown');

  $('#main-content').fadeOut(300).queue(function(next){
    $('#quiz').addClass('hidden');
    $('#result').removeClass('hidden');

    var winner = gameState.players[0]
    gameState.players.map( (player) => {
      if (player.score > winner.score) {
        winner = player;
      }
    });

    $('#winner-text').text(`${winner.username} wins!`);
    $('#winner-score').text(winner.score);

    next();
  }).delay(100).fadeIn(350);
};

$(document).ready(function(){
  init();
});






