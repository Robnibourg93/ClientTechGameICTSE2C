/**
 * Created by Jordi on 17-3-2016.
 */
var socket = io.connect("http://localhost:8080");

function startSplash(){

    window.location.replace("startsplash.html");

}

function checkConnection(){


    if (socket.connected){
        console.log("connected");
        return true;
    }
    else {
        console.log("disconnected");
    }
}

function runSplash(){
    var con = checkConnection();
    if(con){
        window.location.replace("Index.html");

    }else{
        setTimeout('runSplash()', 2000);
    }

}
