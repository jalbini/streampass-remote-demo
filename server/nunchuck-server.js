var rooms = {};
var users = {};

var newestRoomId = null;

module.exports = function(io) {

  // Socket code

  io.on('connection', function(socket){
    console.log('A user connected');

    var type, _id;

    socket.on('disconnect', function(){
      if (type === 'host' && _id){
        delete rooms[_id];
      } else if (type === 'player' && _id) {
        delete users[_id];
      }
    });

    socket.on('nunchuck-create', function(id){
      console.log("Created a room with ID: " + id);

      type = 'host';
      _id = id;
      rooms[id] = socket;
      
      newestRoomId = _id;
    });

    socket.on('nunchuck-join', function(msg){
      // default to newest room if no room id given
      if (msg.id == null) {
        msg.id = newestRoomId;
      }

      var response = {
        userId: msg.userId,
        username: msg.username,

        id: msg.id, //roomId
        success: false,
        msg: "Unknown Error"
      };

      if (type !== 'host' && rooms[msg.id]){
        console.log("User " + msg.username + " (#" + msg.userId + ") joined room " + msg.id);

        // store user
        type = 'player';

        _id = msg.userId;
        users[_id] = socket;

        // create response
        response.success = true;
        response.msg = "Successfully joined room.";

        // emit response to both room and user
        rooms[msg.id].emit('nunchuck-join', response);
        socket.emit('nunchuck-join', response);
        return;
      }

      if (type === 'host'){
        response.msg = "Hosts cannot join rooms."
      }

      if (!rooms[msg.id]){
        response.msg = "That room doesn't exist!"
      }

      socket.emit('nunchuck-join', response);
    });

    socket.on('nunchuck-data', function(data){
      if (type === 'player' && rooms[data.roomId]){
        rooms[data.roomId].emit('nunchuck-data', data)
      }
    })

    socket.on('nunchuck-set-state', function(data){
      console.log("Room #" + _id + " setting player #" + data.userId + " state to " + data.state);

      if (type === 'host' && users[data.userId]){
        users[data.userId].emit('nunchuck-set-state', data);
      }
    })
  });
};