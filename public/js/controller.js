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

function animateIn(id){
  $('#' + id)
      .addClass('animated slideInUp')
      .css('display', 'block');
}

function toggleReady() {
    $('#ready button').toggleClass('checked');
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
      .css('display', 'block');
}
