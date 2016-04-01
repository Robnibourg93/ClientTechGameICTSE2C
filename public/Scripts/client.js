var context;
var rightKey = false;
var leftKey = false;
var upKey = false;
var downKey = false;
var game = {};
var localPlayer = {
    width: 40,
    height: 40,
    name: '',
    speed: 50,
    jumpSpeed: 6,
    velX: 0,
    velY: 0,
    playerSpriteX: 0,
    playerSpriteY: 0,
    jumping: false,
    score: 0,
    health: 100
};
var remotePlayers = [];
var friction = 0.8;
var gravity = 0.3;
var boxes = [];
var bullets = [];
var remoteBullets = [];
var gun = {bulletSpeed: 9, rateOfFire: 2};
var playerSprite = new Image();
playerSprite.src = "./Resources/Sprites/DudeFull.png";

// dimensions

boxes.push({
    x: 0,
    y: 0,
    width: 1200,
    height: 0.1
});

boxes.push({
    x: 0,
    y: 400,
    width: 100,
    height: 20
});

boxes.push({
    x: 300,
    y: 200,
    width: 100,
    height: 20
});

boxes.push({
    x: 230,
    y: 500,
    width: 15,
    height: 100
});

boxes.push({
    x: 730,
    y: 500,
    width: 15,
    height: 100
});

boxes.push({
    x: 550,
    y: 200,
    width: 100,
    height: 20
});


boxes.push({
    x: 400,
    y: 450,
    width: 150,
    height: 20
});

boxes.push({
    x: 900,
    y: 400,
    width: 100,
    height: 20
});


$(document).ready(function () {
    //get player name from hiddenfield
    localPlayer.name = localStorage.getItem('playerName');

    console.log(localPlayer.name);
    //get context game canvas
    canvas = $("#gameCanvas");
    context = canvas[0].getContext('2d');

    //get canvas width and height
    game.width = canvas.width();
    game.height = canvas.height();

    //set player start position
    localPlayer.x = game.width / 2;
    localPlayer.y = game.height - 5;

    //this will set the game-loop for drawing. sort of timer as it were.
    setInterval(draw, 12);

    //clearInterval(drawing);

    //need to clear canvas else older drawings will polute game canvas(trail behind player for )
    function clearCanvas() {
        context.clearRect(0, 0, game.width, game.height);
    }

    //game loop -> this part is needed to be rewitten so we can use player.moveTo(x,y). This will increase preformance of the propably.
    function draw() {
        clearCanvas();
        drawBullets();
        // animatePlayer();
        drawScoreBoard();
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
        //animatePlayer();


        //Friction (slide) and gravity is set
        localPlayer.velX *= friction;
        localPlayer.velY += gravity;


        localPlayer.grounded = false;
        for (var i = 0; i < boxes.length; i++) {
            context.fillStyle = "green";
            context.fillRect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);

            var dir = colCheck(localPlayer, boxes[i]);

            if (dir === "l" || dir === "r") {
                localPlayer.velX = 0;
                localPlayer.jumping = false;
            } else if (dir === "b") {
                localPlayer.grounded = true;
                localPlayer.jumping = false;
            } else if (dir === "t") {
                localPlayer.velY *= -1;
            }

        }


        localPlayer.x += localPlayer.velX;
        localPlayer.y += localPlayer.velY;

        if (localPlayer.grounded) {
            localPlayer.velY = 0;
        }
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


        socket.emit(bullets);
        //this will send the localPlayer to the server
        socket.emit("Player", localPlayer);

        //draw name
        context.fillStyle = "red";
        context.fillText(localPlayer.name, localPlayer.x - (localPlayer.width / 5), localPlayer.y - 5);


        //draw other players
        remotePlayers.forEach(function (player) {
            context.fillStyle = "red";
            context.fillText(player.name, player.x - (player.width / 5), player.y - 5);
            var spriteX = player.playerSpriteX * playerSprite.width / 11;
            var spriteY = player.playerSpriteY * playerSprite.height / 11;
            context.drawImage(playerSprite, spriteX, spriteY, 128, 128, player.x, player.y, player.width, player.height)
        });
    }

    var jumpingRight = false, jumpingLeft = false, runningRight = false, runningLeft = false;

    function animatePlayer() {

        if (localPlayer.jumping && localPlayer.velX > 0) {
            //animate jump right

            if (!jumpingRight) {
                console.log('jumping right');
                var endFrame = {x: 1, y: 6};
                var startFrame = {x: 1, y: 5};
                jumpingRight = true;
            }


            if (startFrame.x != 11) {
                startFrame.x += 1;
            } else {
                startFrame.x = 1;
                if (startFrame.y != 11) {
                    startFrame.y += 1;
                } else {
                    startFrame = {x: 1, y: 5}
                }
            }


            if (startFrame.x == endFrame.x && startFrame.y == endFrame.y) {
                jumpingRight = false;
            }
            console.log(JSON.stringify(startFrame));
            localPlayer.playerSpriteX = startFrame.x;
            localPlayer.playerSpriteY = startFrame.y;
            jumpingLeft = false;
            runningRight = false;
            runningLeft = false;
        }
        if (localPlayer.jumping && localPlayer.velX < 0) {
            //animate jump left

            if (!jumpingLeft) {
                console.log('jumping left');
                startFrame = {x: 3, y: 10};
                endFrame = {x: 3, y: 11};
                jumpingLeft = true;
            }


            if (startFrame.x != 11) {
                startFrame.x += 1;
            } else {
                startFrame.x = 1;
                if (startFrame.y != 11) {
                    startFrame.y += 1;
                } else {
                    startFrame = {x: 3, y: 10}
                }
            }

            (startFrame.x == endFrame.x && startFrame.y == endFrame.y) ? jumpingLeft = false : null;
            console.log(JSON.stringify(startFrame));
            localPlayer.playerSpriteX = startFrame.x;
            localPlayer.playerSpriteY = startFrame.y;
            jumpingRight = false;
            runningRight = false;
            runningLeft = false;
        }
        if (!localPlayer.jumping && localPlayer.velX < 0) {
            //animate walk left

            if (!runningLeft) {
                console.log('walk left');
                startFrame = {x: 5, y: 6};
                endFrame = {x: 6, y: 8};
                runningLeft = true;
            }


            if (startFrame.x != 11) {
                startFrame.x += 1;
            } else {
                startFrame.x = 1;
                if (startFrame.y != 11) {
                    startFrame.y += 1;
                } else {
                    startFrame = {x: 5, y: 6}
                }
            }

            if (startFrame.x == endFrame.x && startFrame.y == endFrame.y) runningLeft = false;
            console.log(JSON.stringify(startFrame));
            localPlayer.playerSpriteX = startFrame.x;
            localPlayer.playerSpriteY = startFrame.y;

            jumpingLeft = false;
            runningRight = false;
            jumpingRight = false;
        }
        if (!localPlayer.jumping && localPlayer.velX > 0) {
            //animate walk Right

            if (!runningRight) {
                console.log('Start Animation run right');
                startFrame = {x: 7, y: 1};
                endFrame = {x: 6, y: 2};
                runningRight = true;
            }


            if (startFrame.x != 11) {
                startFrame.x += 1;
            } else {
                startFrame.x = 1;
                if (startFrame.y != 11) {
                    startFrame.y += 1;
                } else {
                    startFrame = {x: 4, y: 1}
                }
            }

            if (startFrame.x == endFrame.x && startFrame.y == endFrame.y) {
                console.log('walk right');
                runningRight = false;
            }
            console.log(JSON.stringify(startFrame));
            localPlayer.playerSpriteX = startFrame.x;
            localPlayer.playerSpriteY = startFrame.y;
            jumpingLeft = false;
            jumpingRight = false;
            runningLeft = false;
        }
    }

    function drawBullets() {
        //loop trough bullets collection
        //add bullet speed to x loc
        //draw bullet
        remoteBullets.forEach(function (remoteBulletsList) {
            remoteBulletsList.forEach(function (bullet, index) {
                context.fillStyle = "Red";
                context.fillRect(bullet.x, bullet.y, bullet.bulletSize, bullet.bulletSize);
                if (bullet.direction == "right") {
                    bullet.x += bullet.speed;
                } else if (bullet.direction == "left") {
                    bullet.x -= bullet.speed;
                }
                if (bullet.x >= game.width - bullet.bulletSize) {
                    //remove bullet from list
                    bullet.x = game.width - bullet.bulletSize;

                    bullets.splice(index, 1);
                } else if (bullet.x <= 0) {

                    bullet.x = 0;

                    bullets.splice(index, 1);
                }

            })
        });

        bullets.forEach(function (bullet, index) {
            context.fillStyle = "black";
            console.log(bullet);
            context.fillRect(bullet.x, bullet.y, bullet.bulletSize, bullet.bulletSize);
            if (bullet.direction == "right") {
                bullet.x += bullet.speed;
            } else if (bullet.direction == "left") {
                bullet.x -= bullet.speed;
            }
            if (bullet.x >= game.width - bullet.bulletSize) {
                //remove bullet from list
                bullet.x = game.width - bullet.bulletSize;

                bullets.splice(index, 1);
            } else if (bullet.x <= 0) {

                bullet.x = 0;

                bullets.splice(index, 1);
            }
        });
        socket.emit("Bullets", bullets);
    }

    var counter = gun.rateOfFire;

    function shoot(gun) {
        //set direction


        if (counter == gun.rateOfFire) {

            var bullet = {speed: gun.bulletSpeed, x: localPlayer.x, y: localPlayer.y, bulletSize: 4};
            bullet.x = bullet.x + 17;
            bullet.y = bullet.y + 13;
            (localPlayer.velX > 0) ? bullet.direction = 'right' : bullet.direction = 'left';

            console.log(bullet);

            bullets.push(bullet);
            counter = 0;
        } else {
            counter++;
        }

        //change bullet speed according to gun
        //add new bullet to list
    }

    function drawScoreBoard() {

        var canvas = document.getElementById("gameCanvas");
        if (canvas.getContext) {
            var context = canvas.getContext("2d");
            var context2 = canvas.getContext("2d");
            var context3 = canvas.getContext("2d");

            context.fillStyle = "rgb(144, 210, 231)";
            context.strokeStyle = "Blue";
            context.textAlign = "left";

            context.fillText(localPlayer.name + " : " + localPlayer.health + "HP", 20, 20);
            context.fillText("score : " + localPlayer.score, 20, 40);

            context2.fillText("Player2 : " + localPlayer.health + "HP", 120, 20);
            context2.fillText("score : " + localPlayer.score, 120, 40);

            context3.fillText("Player3 : " + localPlayer.health + "HP", 220, 20);
            context3.fillText("score : " + localPlayer.score, 220, 40);
            //
            //for (var key in remotePlayers) {
            //
            //    if (!remotePlayers.hasOwnProperty(key)) continue;
            //
            //    var obj = remotePlayers[key];
            //    for (var prop in obj) {
            //
            //        if(!obj.hasOwnProperty(prop)) continue;
            //        alert(prop + " = " + obj[prop]);
            //    }
            //}
            //

            //context2.fillText(localPlayer.name + " : ", 20,50);

            //context.fillText("World!", 10 + context.measureText("Hello ").width, 100);
        }

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
        if (evt.keyCode === 32)
            shoot(gun);
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
        if (evt.keyCode === 32)
            counter = gun.rateOfFire;
    }

    //connect to server
    var socket = io.connect("http://localhost:8080");

    //listens to ServerMessage
    socket.on("ServerMessage", function (data) {
        alert(data);
    });

    //send Player js object to server
    socket.emit("Player", localPlayer);

    socket.on('allBullets', function (allBullets) {
        remoteBullets = allBullets;
    });

    //get players on page load and display them in table.
    socket.on("getPlayers", function (players) {
        remotePlayers = players;
        console.log('getting players');

    });
    //listens if remote players have changed.
    socket.on("Players", function (players) {
        //this is kind of a hack to compare 2 json objects with each other. we can use this since the position of the player objects within the players doesn't change.
        if (JSON.stringify(remotePlayers) != JSON.stringify(players)) {
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
        console.log("Player left the game :'(" + player.id);
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
        console.log("test:" + localPlayer.id);
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


    var dialog = $("#dialog-form").dialog({
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
            form[0].reset();
        }
    });

    var form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        changeName();
    });

    $("#change-name").on("click", function () {
        dialog.dialog("open");
    });

    //Set game canvas width and height - 100 so it doesnt fill whole screen. (-100 serves as some kind of margin)
    canvas.width(window.innerWidth - 100);
    canvas.height(window.innerHeight - 100);
    $(document).keydown(onKeyDown);
    $(document).keyup(onKeyUp);

});

//if window resizes change width and height. This makes it scaleable.
$(window).resize(function () {
    canvas.width(window.innerWidth - 100);
    canvas.height(window.innerHeight - 100);
});

