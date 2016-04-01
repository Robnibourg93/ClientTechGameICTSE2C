/**
 * Created by Rob Nibourg on 1-4-2016.
 */
$(document).ready(function () {

    //connect to server
    var socket = io.connect("http://localhost:8080");

    //listens to ServerMessage
    socket.on("Players", function (data) {
        $('#PlayerList').empty();
        data.forEach(function (player) {
            $('#PlayerList').append("<div id='"+player.id+"'> </div>");
        });
        setTimeout('1',100);
    });


});
function startGame(){
    var playerName = $('#PlayerName').val();
    console.log(playerName);
    localStorage.setItem('playerName',playerName);

    window.location.replace("startsplash.html");
}