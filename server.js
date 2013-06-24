var http = require('http');
var static = require('node-static');
var io = require('socket.io');
var SonosDiscovery = require('sonos-discovery');
var discovery = new SonosDiscovery();
var port = 8080;

var fileServer = new(static.Server)('./static');

var server = http.createServer(function (req, res) {
	
	req.addListener('end', function () {
        fileServer.serve(req, res);
    }).resume();
});

var socketServer = io.listen(server);

socketServer.sockets.on('connection', function (socket) {
	socket.emit('topology-change', discovery.getZones());

  	socket.on('transport-state', function (data) {

        console.log("socket on transport-state");
	    // find player based on uuid
	    var player = discovery.getPlayerByUUID(data.uuid);

	    if (!player) {
            console.error("Error: no player for UUID " + data.uuid);
            return;
        }

	    // invoke action
	    console.log("state " + data.state);

        if (player[data.state]){
            player[data.state](data.value, data.forGroup);
        }else{
            console.error("Error: " + data.state + " is not a function of player");
        }

  	});

    socket.on('mute', function (data) {
        console.log("on mute");
        console.log(JSON.stringify(data));

        var player = discovery.getPlayerByUUID(data.uuid);

        if (player){
            player.mute(data.state.Master,data.state.forGroup);
        }
    });
});

discovery.on('topology-change', function (data) {
	socketServer.sockets.emit('topology-change', data);
});

discovery.on('notify', function (data) {
    // get raw data ow all notifications
});

discovery.on('transport-state', function (data) {
    console.log("discovery on transport-state");
    console.log(JSON.stringify(data, null, 4));
    socketServer.sockets.emit('transport-change', data);
});

discovery.on('volume', function (data) {
    console.log("discovery on volume");
    console.log(JSON.stringify(data, null, 4));
    socketServer.sockets.emit('volume', data);
});

discovery.on('mute', function (data) {
    console.log("discovery on mute");
    console.log(JSON.stringify(data, null, 4));
    socketServer.sockets.emit('mute', data);
});

// Attach handler for socket.io

server.listen(port);

console.log("http server listening on port", port);
