var context;
var rightKey = false;
var leftKey = false;
var upKey = false;
var downKey = false;
var block_h = 30;
var block_w = 30;
var game = {};
var localPlayer = {width: 30, height: 30, name: '', speed: 50, jumpSpeed:6, velX: 0, velY: 0, jumping: false};
var remotePlayers = [];
var friction = 0.8;
var gravity = 0.3;
var boxes = [];

// dimensions
boxes.push({
    x: 0,
    y: 0,
    width: 10,
    height: 200
});
boxes.push({
    x: 0,
    y: 200 - 2,
    width: 600,
    height: 50
});
boxes.push({
    x: 600 - 10,
    y: 0,
    width: 50,
    height: 200
});

boxes.push({
    x: 120,
    y: 10,
    width: 80,
    height: 80
});
boxes.push({
    x: 170,
    y: 50,
    width: 80,
    height: 80
});
boxes.push({
    x: 220,
    y: 100,
    width: 80,
    height: 80
});
boxes.push({
    x: 270,
    y: 150,
    width: 40,
    height: 40
});


$(document).ready(function () {
    //get player name from hiddenfield
    localPlayer.name = $('#playerName').val();

    console.log(localPlayer.name);
    //get context game canvas
    context = $('#gameCanvas')[0].getContext('2d');

    //get canvas width and height
    game.width = $('#gameCanvas').width();
    game.height = $('#gameCanvas').height();

    //set player start position
    localPlayer.x = game.width / 2;
    localPlayer.y = game.height -5 ;

    //this will set the game-loop for drawing. sort of timer as it were.
    setInterval(draw, 12);

    var pl = [];

    //need to clear canvas else older drawings will polute game canvas(trail behind player for )
    function clearCanvas() {
        context.clearRect(0, 0, game.width, game.height);
    }

    //game loop -> this part is needed to be rewitten so we can use player.moveTo(x,y). This will increase preformance of the propably.
    function draw() {
        clearCanvas();

        //if button is pushed move player by [speed]
        if (rightKey)
            if (localPlayer.velX < localPlayer.speed) {
                localPlayer.velX++;
            }
        if (leftKey)
            if (localPlayer.velX > -localPlayer.speed) {
                localPlayer.velX--;
            }
        if (upKey)
            if (!localPlayer.jumping) {
                localPlayer.jumping = true;
                localPlayer.velY = -localPlayer.jumpSpeed * 2;
            }
        if (downKey) {
          
        }
        
        //Friction (slide) and gravity is set
        localPlayer.velX *= friction;
        localPlayer.velY += gravity;


        localPlayer.grounded = false;
        for (var i = 0; i < boxes.length; i++) {
            context.fillStyle = "green";
            context.rect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);

            var dir = colCheck(localPlayer, boxes[i]);

            if (dir === "l" || dir === "r") {
                localPlayer.velX = 0;
                localPlayer.jumping = false;
            } else if (dir === "b") {
                localPlayer.grounded = true;
                localPlayerr.jumping = false;
            } else if (dir === "t") {
                localPlayer.velY *= -1;
            }

        }

        if (localPlayer.grounded) {
            localPlayer.velY = 0;
        }

        localPlayer.x += localPlayer.velX;
        localPlayer.y += localPlayer.velY;
        
        //Prevents a player to get out of the canvas
        if (localPlayer.x >= game.width - localPlayer.width) {
            localPlayer.x = game.width - localPlayer.width;
        } else if (localPlayer.x <= 0) {
            localPlayer.x = 0;
        }

        if (localPlayer.y >= game.height - localPlayer.height) {
            localPlayer.y = game.height - localPlayer.height;
            localPlayer.jumping = false;
        }
        
        //draw player
        context.fillStyle = "red";
        context.fillRect(localPlayer.x, localPlayer.y, localPlayer.width, localPlayer.height);

        //this will send the localPlayer to the server
        socket.emit("Player", localPlayer);

        //draw name
        context.fillText(localPlayer.name, localPlayer.x - (localPlayer.width / 5), localPlayer.y - 5);

        //draw square -> should be replaced with sprite
        context.fillRect(localPlayer.x, localPlayer.y, localPlayer.width, block_h);

        //draw other players
        remotePlayers.forEach(function (player) {

                console.log(JSON.stringify(player));
                context.fillStyle = "red";
                context.fillText(player.name, player.x - (player.width / 5), player.y - 5);
                context.fillRect(player.x, player.y, player.width, player.height);
        });
    }


    function colCheck(shapeA, shapeB) {
        // get the vectors to check against
        var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
            vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
            // add the half widths and half heights of the objects
            hWidths = (shapeA.width / 2) + (shapeB.width / 2),
            hHeights = (shapeA.height / 2) + (shapeB.height / 2),
            colDir = null;

        // if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
        if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
            // figures out on which side we are colliding (top, bottom, left, or right)
            var oX = hWidths - Math.abs(vX),
                oY = hHeights - Math.abs(vY);
            if (oX >= oY) {
                if (vY > 0) {
                    colDir = "t";
                    shapeA.y += oY;
                } else {
                    colDir = "b";
                    shapeA.y -= oY;
                }
            } else {
                if (vX > 0) {
                    colDir = "l";
                    shapeA.x += oX;
                } else {
                    colDir = "r";
                    shapeA.x -= oX;
                }
            }
        }
        return colDir;
    }

    //handle key input
    function onKeyDown(evt) {
        if (evt.keyCode === 39)
            rightKey = true;
        else if (evt.keyCode === 37)
            leftKey = true;
        if (evt.keyCode === 38)
            upKey = true;
        else if (evt.keyCode === 40)
            downKey = true;
    }
    //handle key input
    function onKeyUp(evt) {
        if (evt.keyCode === 39)
            rightKey = false;
        else if (evt.keyCode === 37)
            leftKey = false;
        if (evt.keyCode === 38)
            upKey = false;
        else if (evt.keyCode === 40)
            downKey = false;
    }

    //connect to server
    var socket = io.connect("http://localhost:8080");

    //listens to ServerMessage
    socket.on("ServerMessage", function (data) {
        alert(data);
    });

    //send Player js object to server
    socket.emit("Player", localPlayer);

    //get players on page load and display them in table.
    socket.on("getPlayers", function (players) {
        remotePlayers = players;
        console.log('getting players');

    });
    //listens if remote players have changed.
    socket.on("Players", function (players) {
        //this is kind of a hack to compare 2 json objects with each other. we can use this since the position of the player objects within the players doesn't change.
        if (JSON.stringify(remotePlayers) != JSON.stringify(players)) {
            console.log('updating');
            //update localPlayer list.
            remotePlayers = players;
        }
    });

    var name = $("input#name");
    //if a new player joined the server add player to table
    socket.on("newPlayer", function (player) {
        console.log("New player joined the game!");
    });

    //if player disconnected from server remove player from table
    socket.on("removePlayer", function (player) {
        console.log("Player left the game :'(");
        });

    function updateTips(t) {
        tips
                .text(t)
                .addClass("ui-state-highlight");
        setTimeout(function () {
            tips.removeClass("ui-state-highlight", 1500);
        }, 500);
    }
    socket.on('getId', function (player) {
        localPlayer.id = player.id;
        console.log('testet:'+localPlayer.id);
    });
    
    
    function checkLength(o, n, min, max) {
        console.log(o);
        if (o.val().length > max || o.val().length < min) {
            o.addClass("ui-state-error");
            updateTips("Length of " + n + " must be between " +
                    min + " and " + max + ".");
            return false;
        } else {
            return true;
        }
    }

    function checkRegexp(o, regexp, n) {
        if (!(regexp.test(o.val()))) {
            o.addClass("ui-state-error");
            updateTips(n);
            return false;
        } else {
            return true;
        }
    }


    function changeName() {
        var valid = true;

        valid = valid && checkLength(name, "username", 3, 16);

        valid = valid && checkRegexp(name, /^[a-z]([0-9a-z_\s])+$/i, "Username may consist of a-z, 0-9, underscores, spaces and must begin with a letter.");

        if (valid) {
            localPlayer.name = name.val();
            dialog.dialog("close");
        }
        return valid;
    }


    dialog = $("#dialog-form").dialog({
        autoOpen: false,
        height: 240,
        width: 350,
        modal: true,
        buttons: {
            "Change name": changeName,
            Cancel: function () {
                dialog.dialog("close");
            }
        },
        close: function () {
            form[ 0 ].reset();
        }
    });

    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        changeName();
    });

    $("#change-name").button().on("click", function () {
        dialog.dialog("open");
    });

    //Set game canvas width and height - 100 so it doesnt fill whole screen. (-100 serves as some kind of margin)
    $("#gameCanvas").width(window.innerWidth - 100);
    $("#gameCanvas").height(window.innerHeight - 100);
    $(document).keydown(onKeyDown);
    $(document).keyup(onKeyUp);

});

//if window resizes change width and height. This makes it scaleable.
$(window).resize(function () {
    $("#gameCanvas").width(window.innerWidth - 100);
    $("#gameCanvas").height(window.innerHeight - 100);
});

