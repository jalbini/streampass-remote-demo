/////////////////////
// Local Variables //
/////////////////////

var username;



////////////////////
// Nunchuck Setup //
////////////////////

var socket = io();
var n = nunchuck.init('player', socket);

n.onJoin(function(data, err){
  if (!err){
    bounceIn('controller');
    bounceOut('join');
  } else {
    alert(err.msg)
  }
});



////////////////////
// Event Handlers //
////////////////////

function onNameInput() {
  username = $('#name-input input').val();

  // replace username placeholder in next streen
  $('#ready div.title').html(
    $('#ready div.title').html().replace('[username]', username)
  );

  animateOut('name-input');
  animateIn('ready');
}

function onPlayerReady() {
  $('#ready button').addClass('checked');
}


///////////////////////
// Animation Helpers //
///////////////////////

function animateIn(id){
  $('#' + id)
      .addClass('animated slideInUp')
      .css('display', 'flex');
}

function animateOut(id){
  $('#' + id)
      .removeClass('animated slideInUp')
      .addClass('animated slideOutUp')
      .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
        $(this)
            .css('display', 'none')
            .removeClass('animated slideOutUp');
        });
}


function toggleReady() {
}



function bounceOut(id){
  $('#' + id)
      .removeClass('animated bounceIn')
      .addClass('animate bounceOut')
      .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
        $(this)
            .css('display', 'none')
            .removeClass('animate bounceOut');
        });
}

function join(){
  n.join($('#username').val(), $('#roomId').val());
}

function bounceIn(id){
  $('#' + id)
      .addClass('animate bounceIn')
      .css('display', 'flex');
}
