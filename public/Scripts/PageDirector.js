/**
 * Created by Jordi on 17-3-2016.
 */

function startSplash(){
    window.close();
    window.open('startsplash.html','_blank');

}

function checkConnection(){

    if (socket.socket.connected){
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