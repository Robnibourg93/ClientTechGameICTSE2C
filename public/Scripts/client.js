var context;
var rightKey = false;
var leftKey = false;
var upKey = false;
var downKey = false;
var speed = 5;
var block_h = 30;
var block_w = 30;
var game = {};
var localPlayer = {width:30,height:30};
var remotePlayers = [];

$(document).ready(function () {

    context = $('#gameCanvas')[0].getContext('2d');
    game.width = $('#gameCanvas').width();
    game.height = $('#gameCanvas').height();
    console.log(context + " context");
    localPlayer.x = game.width / 10;
    localPlayer.y = game.height / 10;
    //this will set the loop for drawing. sort of timer as it were.
    setInterval(draw, 25);

    function clearCanvas() {
        context.clearRect(0, 0, game.width, game.height);
    }

    function draw() {
        clearCanvas();



        if (rightKey) localPlayer.x += speed;
        else if (leftKey) localPlayer.x -= speed;
        if (upKey) localPlayer.y -= speed;
        else if (downKey) localPlayer.y += speed;

        if (localPlayer.x <= 0) localPlayer.x = 0;

        if ((localPlayer.x + block_w) >= game.width) localPlayer.x = game.width - block_w;

        if (localPlayer.y <= 0) localPlayer.y = 0;

        if ((localPlayer.y + block_h) >= game.height) localPlayer.y = game.height - block_h;

        //this will send the localPlayer to the server

        socket.emit("Player", localPlayer);
        //console.log(block_h + " " + block_w + " " + localPlayer.x + " " + localPlayer.y);
        //draw player
        context.fillRect(localPlayer.x, localPlayer.y, block_w, block_h);
        //draw other players
        remotePlayers.forEach(function (player) {
            context.fillRect(player.x, player.y, player.width, player.height);
        })
    }

    function onKeyDown(evt) {
        if (evt.keyCode == 39) rightKey = true;
        else if (evt.keyCode == 37) leftKey = true;
        if (evt.keyCode == 38) upKey = true;
        else if (evt.keyCode == 40) downKey = true;
    }

    function onKeyUp(evt) {
        if (evt.keyCode == 39) rightKey = false;
        else if (evt.keyCode == 37) leftKey = false;
        if (evt.keyCode == 38) upKey = false;
        else if (evt.keyCode == 40) downKey = false;
    }

    var socket = io.connect("http://localhost:8080");

    //listens to ServerMessage
    socket.on("ServerMessage", function (data) {
        alert(data);
    });

    socket.emit("Player", localPlayer);

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

    //listens if there's new Players
    socket.on("Players", function (players) {
        console.log(JSON.stringify(remotePlayers) +" met "+ JSON.stringify(players));
        if (JSON.stringify(remotePlayers) != JSON.stringify(players)) {
            remotePlayers = players;
            var Allfound = false;
            var table = $("#players tbody");

            console.log('loop');
            //update table data
            remotePlayers.forEach(function (player) {
                console.log('loop');
                table.find('tr').each(function (i) {
                    console.log('Looping through table found: '+i);
                    var $tds = $(this).find('td'),
                        id = $tds.eq(0).text();
                    // do something with productId, product, Quantity
                    if (player.id == id) {
                        console.log('Row found trying to update values for'+player.id);
                        console.log(JSON.stringify(player));
                        $(this).find('#Px').html(player.x);
                        $(this).find('#Py').html(player.y);
                        $(this).find('#Pwidth').html(player.width);
                        $(this).find('#Pheight').html(player.height);
                    }
                });
            })
        }
    });

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

    socket.on("removePlayer", function (player) {
        console.log("Player left the game :'(");
        var table = $("#players tbody");
        //find row
        table.find('tr').each(function (i) {
            var $tds = $(this).find('td'),
                id = $tds.eq(0).text();

            //remove table row
            if (player.id == id) {
                $tds.parent().remove();
            }
        });

    })



    $("#gameCanvas").width(window.innerWidth - 100);
    $("#gameCanvas").height(window.innerHeight - 100);
    $(document).keydown(onKeyDown);
    $(document).keyup(onKeyUp);

});
$(window).resize(function () {
    $("#gameCanvas").width(window.innerWidth - 100);
    $("#gameCanvas").height(window.innerHeight - 100);
});

