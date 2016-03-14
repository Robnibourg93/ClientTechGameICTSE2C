﻿var context;
var rightKey = false;
var leftKey = false;
var upKey = false;
var downKey = false;
var block_h = 30;
var block_w = 30;
var game = {};
var localPlayer = {width: 30, height: 30, name: '', speed: 10, jumpSpeed:3, velX: 0, velY: 0, jumping: false};
var remotePlayers = [];
var friction = 0.8;
var gravity = 0.2;

$(document).ready(function () {
    //get player name from hiddenfield
    localPlayer.name = $('#playerName').val();
    name = $("input#name");
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
    setInterval(draw, 25);

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
        context.clearRect(0, 0, game.width, game.height);
        context.fillStyle = "red";
        context.fillRect(localPlayer.x, localPlayer.y, localPlayer.width, localPlayer.height);

        //this will send the localPlayer to the server
        socket.emit("Player", localPlayer);

        //draw name
        context.fillText(localPlayer.name, localPlayer.x - (block_w / 5), localPlayer.y - 5);

        //draw square -> should be replaced with sprite
        context.fillRect(localPlayer.x, localPlayer.y, block_w, block_h);

        //draw other players
        remotePlayers.forEach(function (player) {
            if (player.id !== localPlayer.id) {
                context.fillText(player.name, player.x - (block_w / 5), player.y - 5);
                context.fillRect(player.x, player.y, player.width, player.height);
            }
        });
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
        remotePlayers.forEach(function (player) {
            $("#players tr:last").after("<tr><td id='Pid'>" +
                    player.id
                    + "</td><td id='Px'>" +
                    player.x +
                    "</td><td id='Py'>" +
                    player.y + "</td><td id='Pwidth'>" +
                    player.width + "</td><td id='Pheight'>" +
                    player.height + "</td></tr>");
        });
    });
    //listens if remote players have changed.
    socket.on("Players", function (players) {
        //this is kind of a hack to compare 2 json objects with each other. we can use this since the position of the player objects within the players doesn't change.
        if (JSON.stringify(remotePlayers) !== JSON.stringify(players)) {

            //update localPlayer list.
            remotePlayers = players;

            //get table body
            var table = $("#players tbody");

            //update table data
            remotePlayers.forEach(function (player) {
                table.find('tr').each(function (i) {
                    var $tds = $(this).find('td'),
                            id = $tds.eq(0).text();
                    if (player.id === id) {
                        $(this).find('#Px').html(player.x);
                        $(this).find('#Py').html(player.y);
                        $(this).find('#Pwidth').html(player.width);
                        $(this).find('#Pheight').html(player.height);
                    }
                });
            });
        }
    });

    //if a new player joined the server add player to table
    socket.on("newPlayer", function (player) {
        //add new player to table
        console.log("New player joined the game!");
        $("#players tr:last").after("<tr><td id='Pid'>" +
                player.id
                + "</td><td id='Px'>" +
                player.x +
                "</td><td id='Py'>" +
                player.y + "</td><td id='Pwidth'>" +
                player.width + "</td><td id='Pheight'>" +
                player.height + "</td></tr>");
    });

    //if player disconnected from server remove player from table
    socket.on("removePlayer", function (player) {
        console.log("Player left the game :'(");
        var table = $("#players tbody");

        //find row
        table.find('tr').each(function (i) {
            //get first td from row and put data in id.
            var $tds = $(this).find('td'),
                    id = $tds.eq(0).text();

            //if player id matches id in td remove row.(parent of td)
            if (player.id === id) {
                $tds.parent().remove();
            }
        });

    });

    function updateTips(t) {
        tips
                .text(t)
                .addClass("ui-state-highlight");
        setTimeout(function () {
            tips.removeClass("ui-state-highlight", 1500);
        }, 500);
    }

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

