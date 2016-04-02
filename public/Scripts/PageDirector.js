/**
 * Created by Jordi on 17-3-2016.
 */
var socket = io();

function startSplash() {

    window.location.replace("startsplash.html");

}
function mainMenu() {
    window.location.replace("mainlevelselect.html");
}
function gameOver() {
    window.location.replace("gameOver.html");
}

function checkConnection() {


    if (socket.connected) {
        console.log("connected");
        return true;
    }
    else {
        console.log("disconnected");
    }
}

function runSplash() {
    var con = checkConnection();
    if (con) {
        $('#item1').fadeOut(2000, function(){
        window.location.replace("Index.html");
        });

    } else {
        setTimeout('runSplash()', 2000);
    }

}

function runSplashLobby() {
    var con = checkConnection();
    if (con) {
        window.location.replace("Lobby.html");

    } else {
        setTimeout('runSplashLobby()', 2000);
    }

}

function checkForName(){
    var name = localStorage.getItem('playerName');
    if(name){
        return true;
    }
    return false;
}
