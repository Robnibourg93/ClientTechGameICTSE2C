/**
 * Created by Rob Nibourg on 1-4-2016.
 */
$(document).ready(function () {
    var timeToUpdate = false;
    //connect to server
    var socket = io();

    setInterval(function () {
        timeToUpdate = true;
    }, 1000);

    //listens to ServerMessage
    socket.on("Players", function (data) {
        if (timeToUpdate) {
            
            $('#PlayerList').empty();

            data.forEach(function (player) {
                var playerDiv = $('<div><h4>' + player.name + '</h4><p>score : ' + player.score + '</br>Health : ' + player.health + '</p></div>')
                $('#PlayerList').append(playerDiv);
                playerDiv.attr('id', player.name);
                playerDiv.attr('class', 'PlayerDiv');
            });
        }
    });


});
function startGame() {
    var playerName = $('#PlayerName').val();
    console.log(playerName);
    localStorage.setItem('playerName', playerName);

    window.location.replace("startsplash.html");



}