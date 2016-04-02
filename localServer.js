var http = require('http');
var server = http.createServer(handler);
var players = [];
var bulletList = [];
server.listen(8080);
console.log("listening on port 8080");

function handler(request, response) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World");
    response.end();
    console.log("response sent..");
}

var io = require("socket.io").listen(server);

io.on("connection", function (socket) {

    console.log("user connected: " + socket.id);

    socket.on("ClientMessage", function (data) {
        socket.broadcast.emit("ServerMessage", data); //to all other connected clients
        io.emit("message", data); //to all connected clients
    });

    io.emit('getId', socket.id);

    function valueInRange(value, min, max) {

        return (value <= max) && (value >= min);

    }

    function checkCollision(A, B) {
        var xOverlap = valueInRange(A.x, B.x, B.x + B.width) ||
            valueInRange(B.x, A.x, A.x + A.bulletSize);

        var yOverlap = valueInRange(A.y, B.y, B.y + B.height) ||
            valueInRange(B.y, A.y, A.y + A.bulletSize);

        return xOverlap && yOverlap;
    }

    function calculateDamage() {
        var collided = false;

        bulletList.forEach(function (bulletListPlayer) {
            bulletListPlayer.forEach(function (bullet, bulletIndex) {
                players.forEach(function (player) {
                    collided = checkCollision(bullet, player);
                    if (collided) {
                        bulletListPlayer.splice(bulletIndex, 1);
                        increaseScore(bullet.shotBy);
                        doDamage(player);
                    }
                })
            });

        });

    }

    function increaseScore(playerName) {
        console.log(playerName + 'scored');
        players.forEach(function (player) {
            if (player.name.localeCompare(playerName) == 0) {
                player.score += 10;
                io.sockets.connected[player.id].emit('score');
            }
        })

    }

    function doDamage(hitPlayer) {
        console.log('player damage');
        players.forEach(function (player) {
            if (player.name.localeCompare(hitPlayer.name) == 0) {
                io.sockets.connected[player.id].emit('takeDamage');
                player.health -= 2;
                if (player.health < 0) {
                    isDead(player);
                }
            }
        })


    }

    function isDead(player) {
        //reset player location
        console.log('player died');
        player.x = 3;
        player.y = 3;
        player.health = 100;
        io.sockets.connected[player.id].emit('die');
    }

    socket.on("Player", function (player) {

        player.id = socket.id;

        var found = false;

        //check if player allready connected ifso update player pos and size
        for (var i = 0; i < players.length; i++) {
            if (players[i].id == player.id) {
                players[i].name = player.name;
                players[i].playerSpriteX = player.playerSpriteX;
                players[i].playerSpriteY = player.playerSpriteY;
                players[i].x = player.x;
                players[i].y = player.y;
                players[i].width = player.width;
                players[i].height = player.height;
                found = true;
                break;
            }
        }

        //if not connected create new player
        if (!found) {
            console.log("New player: " + player.id);
            io.emit('getId', player);
            players.push(player);
            socket.broadcast.emit("newPlayer", player);
            socket.emit("getPlayers", players);
            players.forEach(function (player) {
                console.log(player.id);
            })
        }
        //to all other connected clients
        socket.broadcast.emit("Players", players);
        io.emit("Players", players); //to all connected clients
    });

    socket.on('Bullets', function (bulletListPlayer) {
        var found = false;
        calculateDamage();
        bulletListPlayer.id = socket.id;

        bulletList.forEach(function (BulletListP, index) {
            if (BulletListP.id == bulletListPlayer.id) {
                //found list
                bulletList.splice(index, 1);

                found = true;
                bulletList.push(bulletListPlayer);
                socket.broadcast.emit('allBullets', bulletList);
            }
        });
        if (!found) {
            bulletList.push(bulletListPlayer);
            socket.broadcast.emit('allBullets', bulletList);
        }
    });

    socket.on('disconnect', function () {

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

        //Broadcast deleted player
        socket.broadcast.emit("removePlayer", disconnectedPlayer);

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
            if (!found) {
                console.log('Succes, player with id:' + disconnectedPlayer.id + ' has been disconnected and removed from list');
            }
        }
    });
});