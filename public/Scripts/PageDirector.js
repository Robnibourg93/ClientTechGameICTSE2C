/**
 * Created by Jordi on 17-3-2016.
 */

function startSplash(){
    window.close();
    window.open('startsplash.html','_blank');

    //redirect

}

function checkConnection(){

    var socket = io.connect("http://localhost:8080");

    if (socket.connected){
        console.log("connected");
        return true;
    }
    else console.log("disconnected");
}

function runSplash(){

    if(checkConnection()){
        window.close();
        window.open('Index.html','_blank');
    }else{
        setTimeout('checkConnection()', 2000);
    }

}