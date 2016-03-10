$(document).ready(function () {
    var socket = io.connect("http://localhost:8080");
    socket.on("ServerMessage", function (data) {
        alert(data);
    });
    $("#myButton").click(function () { //Don’t forget the Jquery library
        socket.emit("ClientMessage", "Hello World");
    });
})