var express = require('express'),
    app = express(),
    path = require('path'),
    http = require('http').Server(app),
    io = require('socket.io')(http)

app.use(express.static(path.join(__dirname, './www')));

io.on('connection', function (socket) {
    console.log('TESTING THAT CONNECTION');
	

    socket.on('disconnect', function () {
        console.log('TESTING THAT LEAVING BOY');
    });
	
});