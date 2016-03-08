var http = require('http');
var server = http.createServer( handler );
server.listen(8080);
console.log("listening on port 8080");

function handler( request, response ) {
	response.writeHead(200 , { "Content-Type": "text/plain"});
 	response.write("Hello World");
    response.end();
    console.log("response sent..");
};

var io = require("socket.io").listen(server);


io.on("connection", function(socket) {
    console.log("user connected: " + socket.id);
    socket.on("ClientMessage", function (data) {
        socket.broadcast.emit("ServerMessage", data); //to all other connected clients
        io.emit("message", data); //to all connected clients
    });
});

