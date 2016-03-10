var context;
var rightKey = false;
var leftKey = false;
var upKey = false;
var downKey = false;
var speed = 5;
var block_h = 30;
var block_w = 30;
var localPlayer = {};
var remotePlayers = [];

$(document).ready(function () {

    context = $('#gameCanvas')[0].getContext('2d');
    localPlayer.width = $('#gameCanvas').width();
    localPlayer.height = $('#gameCanvas').height();
    console.log(context + " context");
    localPlayer.x = localPlayer.width / 10;
    localPlayer.y = localPlayer.height / 10;
    setInterval(draw, 25);

    function clearCanvas() {
        context.clearRect(0, 0, localPlayer.width, localPlayer.height);
    }

    function draw() {
        clearCanvas();



        if (rightKey) localPlayer.x += speed;
        else if (leftKey) localPlayer.x -= speed;
        if (upKey) localPlayer.y -= speed;
        else if (downKey) localPlayer.y += speed;

        if (localPlayer.x <= 0) localPlayer.x = 0;

        if ((localPlayer.x + block_w) >= localPlayer.width) localPlayer.x = localPlayer.width - block_w;

        if (localPlayer.y <= 0) localPlayer.y = 0;

        if ((localPlayer.y + block_h) >= localPlayer.height) localPlayer.y = localPlayer.height - block_h;

        socket.emit("Player", localPlayer);

        //console.log(block_h + " " + block_w + " " + localPlayer.x + " " + localPlayer.y);
        context.fillRect(localPlayer.x, localPlayer.y, block_w, block_h);
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
    var logged = false;
    //listens if there's new Players
    socket.on("Players", function (players) {
        if (!logged) {
            console.log(JSON.stringify(remotePlayers) + ' met ' + JSON.stringify(players))
            logged = true;
        }
        if (JSON.stringify(remotePlayers) === JSON.stringify(players)) {
            console.log(players);
            remotePlayers = players;
            player = remotePlayers[remotePlayers.lenght - 1];
            $("#players tr:last").after("<tr><td>" + player.id + "</td><td>" + player.x + "</td><td>" + player.y + "</td><td>" + player.width + "</td><td>" + player.height + "</td></tr>");
        }
    });



    $("#gameCanvas").width(window.innerWidth - 100);
    $("#gameCanvas").height(window.innerHeight - 100);
    $(document).keydown(onKeyDown);
    $(document).keyup(onKeyUp);

});
$(window).resize(function () {
    $("#gameCanvas").width(window.innerWidth - 100);
    $("#gameCanvas").height(window.innerHeight - 100);
});

