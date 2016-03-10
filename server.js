var http = require('http');
var server = http.createServer(handler);
var players = [];
server.listen(8080);
console.log("listening on port 8080");

function handler( request, response ) {
	response.writeHead(200 , { "Content-Type": "text/plain"});
 	response.write("Hello World");
    response.end();
    console.log("response sent..");
};

var io = require("socket.io").listen(server);


io.on("connection", function(socket) {

    console.log("user connected: " + socket.id);

    socket.on("ClientMessage", function (data) {
        socket.broadcast.emit("ServerMessage", data); //to all other connected clients
        io.emit("message", data); //to all connected clients
    });

    socket.on("Player", function (player) {

        player.id = socket.id;

        var found = false;
        //check if player allready connected
        for (var i = 0; i < players.length; i++) {
            if (players[i].id == player.id) {
                found = true;
                break;
            }
        }
        //if not connected create new player
        if (!found) {
            console.log("New player: " + player.id);
            players.push(player);

            players.forEach(function (player) {
                console.log(player.id);
            })

        }
        socket.broadcast.emit("Players", players); //to all other connected clients
        io.emit("Players", players); //to all connected clients
    });

    socket.on('disconnect', function (data) {
        var found = false;
        var disconnectedPlayer;
        //try to remove player from list
        for (var i = 0; i < players.length; i++) {
            if (players[i].id == socket.id) {
                disconnectedPlayer = players[i];
                players.splice(i, 1);
                found = true;
                break;
            }

        }
        //check if player is found
        if (!found) {
            console.log('player not found and thus not removed from list');
        }
        //check if player is removed from list
        if (found) {
            found = false;
            for (var i = 0; i < players.length; i++) {
                if (players[i].id == disconnectedPlayer.id) {
                    console.log('Whoa! Player was found but not removed from list');
                    found = true;
                    break;
                }
            }
            if(!found){
                console.log('Succes, player with id:'+disconnectedPlayer.id+' has been disconnected and removed from list');
            }
        }
    })
});

