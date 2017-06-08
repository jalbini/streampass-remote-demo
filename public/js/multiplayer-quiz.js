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

      $(document).ready(function(){
        $('.code').text(n.roomId)
      });