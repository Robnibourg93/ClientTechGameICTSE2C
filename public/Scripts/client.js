var context;
var rightKey = false;
var leftKey = false;
var upKey = false;
var downKey = false;
var speed = 5;
var block_h = 30;
var block_w = 30;
var game = {};
var localPlayer = {width:30,height:30,name:''};
var remotePlayers = [];

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
    localPlayer.x = game.width / 10;
    localPlayer.y = game.height / 10;

    //this will set the game-loop for drawing. sort of timer as it were.
    setInterval(draw, 25);

    //load background image from resources

    /* currently disabled developing -> player names
        var background = new Image();
        background.src = "./Resources/gameBackground.png";
        context.drawImage(background,0,0);   
    */

    //need to clear canvas else older drawings will polute game canvas(trail behind player for )
    function clearCanvas() {
        context.clearRect(0, 0, game.width, game.height);
       // context.drawImage(background, 0, 0);
    }

    //game loop -> this part is needed to be rewitten so we can use player.moveTo(x,y). This will increase preformance of the propably.
    function draw() {
        clearCanvas();


        //if button is pushed move player by [speed]
        if (rightKey) localPlayer.x += speed;
        else if (leftKey) localPlayer.x -= speed;
        if (upKey) localPlayer.y -= speed;
        else if (downKey) localPlayer.y += speed;
        
        //x,y are set on the top left corner of the rect.

        //player location x can't be less than 0. This keeps the player from moving through the border of the canvas
        if (localPlayer.x <= 0) localPlayer.x = 0;
        //player location x can't be more than canvas width minus playerwidth.
        if ((localPlayer.x + block_w) >= game.width) localPlayer.x = game.width - block_w;

        //same as 2 lines above but now for y location.
        if (localPlayer.y <= 0) localPlayer.y = 0;
        if ((localPlayer.y + block_h) >= game.height) localPlayer.y = game.height - block_h;

        //this will send the localPlayer to the server
        socket.emit("Player", localPlayer);

        //draw player

        //draw name
        context.fillText(localPlayer.name, localPlayer.x - (block_w/5), localPlayer.y-5 );

        //draw square -> should be replaced with sprite
        context.fillRect(localPlayer.x, localPlayer.y, block_w, block_h);

        //draw other players
        remotePlayers.forEach(function (player) {
            if(player.id != localPlayer.id){
                context.fillText(player.name, player.x - (block_w / 5), player.y - 5);
                context.fillRect(player.x, player.y, player.width, player.height);
            }
        })
    }

    //handle key input
    function onKeyDown(evt) {
        if (evt.keyCode == 39) rightKey = true;
        else if (evt.keyCode == 37) leftKey = true;
        if (evt.keyCode == 38) upKey = true;
        else if (evt.keyCode == 40) downKey = true;
    }
    //handle key input
    function onKeyUp(evt) {
        if (evt.keyCode == 39) rightKey = false;
        else if (evt.keyCode == 37) leftKey = false;
        if (evt.keyCode == 38) upKey = false;
        else if (evt.keyCode == 40) downKey = false;
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
        })
    })

    //listens if remote players have changed.
    socket.on("Players", function (players) {
        //this is kind of a hack to compare 2 json objects with each other. we can use this since the position of the player objects within the players doesn't change.
        if (JSON.stringify(remotePlayers) != JSON.stringify(players)) {
            //update localPlayer list.
            remotePlayers = players;

            //get table body
            var table = $("#players tbody");

            //update table data
            remotePlayers.forEach(function (player) {
                table.find('tr').each(function (i) {
                    var $tds = $(this).find('td'),
                        id = $tds.eq(0).text();
                    if (player.id == id) {
                        $(this).find('#Px').html(player.x);
                        $(this).find('#Py').html(player.y);
                        $(this).find('#Pwidth').html(player.width);
                        $(this).find('#Pheight').html(player.height);
                    }
                });
            })
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
            if (player.id == id) {
                $tds.parent().remove();
            }
        });

    })


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

