const socket = new  WebSocket('ws://localhost:8080/v1/ws/server');

socket.onmessage = function (event) {
    //console.log("===onmessage:",event.data);
    var rsp = JSON.parse(event.data);
    if (!rsp.success){
        return;
    }
    var target = websock.funcMap.get(rsp.type);
    if (target != null){
        target.callback(rsp.data,target._this);
    }
};

socket.onopen = function(event) {
    console.log("websocket is opened");
}

socket.onclose = function(event) {
    console.log("WebSocket is closed now.");
};

socket.onerror = function(event) {
    console.log("error",event.data);
};

var websock = {   
    funcMap: new Map(),
    RegistFunc(typ,callback,_this){
        this.funcMap.set(typ,{callback,_this});
    },
    SendMsg (typ,msg) {
        var msg = JSON.stringify({"type":typ,"data":msg});
        socket.send(msg);
        //console.log("sendmsg",msg);
    },
};

module.exports = websock;