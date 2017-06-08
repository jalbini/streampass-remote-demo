/////////////////////
// Local Variables //
/////////////////////

var username;
var currentState;



////////////////////
// Nunchuck Setup //
////////////////////

var socket = io();
var n = nunchuck.init('player', socket);

n.onJoin(function(data, err){
  if (err){
    alert(err.msg);
    location.reload();
  }
});

n.onStateChange(function(state, data) {
  switch(state) {
    case 'buzzer':
      onShowBuzzer();
      break;

    case 'answer-select':
      onShowAnswerSelect(data.questionNumber, data.currentScore);
      break;
  }
});



////////////////////
// Event Handlers //
////////////////////

function onNameInput() {
  username = $('#name-input input').val();

  // join open room
  n.join(username, null);

  // replace username placeholder in next streen
  $('#ready div.title').text(
    $('#ready div.title').text().replace('[username]', username)
  );

  show('ready');
}

function onPlayerReady() {
  $('#ready button').addClass('checked');
  n.pressButton('ready'); // emit ready state
}

function onShowBuzzer() {
  show('buzzer');
}

function onShowAnswerSelect(questionNumber, currentScore) {
  $('#answer-select .question-header').text('Question #' + questionNumber);
  $('#answer-select .score').text('--- Score: '+currentScore+' ---');

  startCountdown();
  show('answer-select');
}


///////////////////////
// Countdown Helpers //
///////////////////////
var tickTimeoutId = null;
var countdownValue = 10;

function startCountdown() {
  countdownValue = 10;
  $('#answer-select .countdown-timer').removeClass('animated flash infinite');

  tick();
}

function tick() {
  if (tickTimeoutId) {
    clearTimeout(tickTimeoutId);    
  }

  // update display
  $('#answer-select .countdown-timer').text(
    (countdownValue > 9 ? ':' : ':0') + countdownValue
  );

  if (countdownValue === 0) {
      $('#answer-select .countdown-timer').addClass('animated flash infinite');
  }

  // decrement countdown
  countdownValue -= 1;

  if (countdownValue >= 0) {
    setTimeout(tick, 1000);
  }
}

function stopCountdown() {

}



///////////////////////
// Animation Helpers //
///////////////////////
function show(state) {
  if (state == currentState)
    return;

  if (currentState) {
    animateOut(currentState);
  }

  animateIn(state);
}

function animateIn(id){
  currentState = id;
  $('#' + id)
      .removeClass('animated slideOutUp')
      .addClass('animated slideInUp')
      .css('display', 'flex');
}

function animateOut(id){
  $('#' + id)
      .removeClass('animated slideInUp')
      .addClass('animated slideOutUp')
}
