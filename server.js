var express = require('express');
var path = require('path');
var app = express();
var fs = require('fs');

var constants = require('constants');
var options = {
	key: fs.readFileSync('/etc/letsencrypt/archive/precure.ddns.net/privkey1.pem'),
	cert: fs.readFileSync('/etc/letsencrypt/archive/precure.ddns.net/fullchain1.pem'),
	ca: fs.readFileSync('/etc/letsencrypt/archive/precure.ddns.net/chain1.pem')
}

var https = require('https');
var Server = https.createServer(options, app);

var io = require('socket.io')(Server);
var port = process.env.PORT || 443;






var listedPeople = [];
var currentOnline = [];

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });

    socket.on('typing', function(msg){
        io.emit('typing', msg);
    });

    

    socket.on('username', function(msg){
        var socketId = socket.id;
        var ip = socket.request.connection.remoteAddress;
        
        ip = ip.split(':').pop();

        listedPeople.push({'id':socketId, 'name':msg, 'ip':ip})

        currentOnline.push(msg)
        console.log("CURRENTLY ONLINE:");
        console.log("[Current Connections: " + "  -  " + msg + "  -  " + socketId + "  -  " + ip + ']');
        
        io.emit('people', currentOnline + ' == = == ' + currentOnline.length);

        console.log("[New Connection: " + "  -  " + msg + "  -  " + socketId + "  -  " + ip + ']');
    });  

    




    io.emit('people', currentOnline + ' == = == ' + currentOnline.length);

    socket.on('disconnect', function(socket){
        
        var clients = Object.keys(io.sockets.connected);
        
        currentOnline = [];        

        try {
            for(i = 0; i<clients.length;i++){
                for(p = 0; p<listedPeople.length ; p++){
                    if(clients[i] === listedPeople[p].id){
                        currentOnline.push(listedPeople[p].name)                
                    }
                }
            }
            console.log("CURRENTLY ONLINE:");
            console.log("[Current Connections: " + "  -  " + msg + "  -  " + socketId + "  -  " + ip + ']');
        } catch (e) {
        }
        
        io.emit('people', currentOnline + ' == = == ' + currentOnline.length);   

    });


});



Server.listen(443, 'precure.ddns.net');
 
console.log("CURRENT ONLINE: " + currentOnline);

