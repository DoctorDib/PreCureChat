/**
 * Created by James on 30/09/2017.
 */
try{
    var express = require('express');
    var path = require('path');
    var app = express();
    var fs = require('fs');

    var constants = require('constants');
    var options = {
        key: fs.readFileSync('/etc/letsencrypt/archive/precure.ddns.net/privkey1.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/archive/precure.ddns.net/fullchain1.pem'),
        ca: fs.readFileSync('/etc/letsencrypt/archive/precure.ddns.net/chain1.pem')
    };

    var https = require('https');
    var Server = https.createServer(options, app);
    var io = require('socket.io')(Server);
    var port = process.env.PORT || 443;

    var listedPeople = [];
    var currentOnline = [];

    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/', function(req, res){
        console.log('YIKES');
        res.sendFile(__dirname + '/index.html');
    });


    io.on('connection', function(socket){
        socket.on('chat message', function(msg){
            console.log('MESSAGE');
            io.emit('chat message', msg);
        });

        socket.on('typing', function(msg){
            console.log('TYPING');
            io.emit('typing', msg);
        });

        socket.on('login', function(user){
            console.log('TYPING');
            io.emit('login', user);
        });



        socket.on('username', function(msg){
            console.log('USERNAME');
            var socketId = socket.id;
            var ip = socket.request.connection.remoteAddress;

            ip = ip.split(':').pop();

            listedPeople.push({'id':socketId, 'name':msg});

            var clientData = {'id':socketId, 'name':msg};
            //currentOnline.push(clientData);

            //console.log("CURRENTLY ONLINE:");
            //console.log("[Current Connections: " + "  -  " + msg + "  -  " + socketId + "  -  " + ip + ']');

            io.emit('people', currentOnline);// + ' == = == ' + currentOnline.length);

            console.log("[New Connection: " + "  -  " + msg + "  -  " + socketId + "  -  " + ip + ']');
        });

        //io.emit('people', currentOnline + ' == = == ' + currentOnline.length);

        socket.on('disconnect', function(socket){

            var clients = Object.keys(io.sockets.connected);
            console.log('Disconnect');
            var onlineCache = currentOnline;
            currentOnline = [];
            var onlinePeople = listedPeople;

            //io.emit('debug', socket);

            try {
                for(i = 0; i<clients.length;i++){
                    for(p = 0; p<listedPeople.length ; p++){
                        if(clients[i] === listedPeople[p].id){
                            currentOnline.push(listedPeople[p])
                        }
                    }
                }
                for(var x = 0; x<listedPeople.length; x++){
                    if(!currentOnline.includes(listedPeople[x])){
                        io.emit('disconnect', listedPeople[x].name);
                        break;
                    }
                }
                listedPeople = currentOnline;
                console.log("CURRENTLY ONLINE:");
                //console.log("[Current Connections: " + "  -  " + socketId + ']');
            } catch (e) { console.log(e)
            }

            console.log(currentOnline);
            io.emit('people', currentOnline);// + ' == = == ' + currentOnline.length);

        });


    });



    Server.listen(443, 'precure.ddns.net');

    console.log("CURRENT ONLINE: " + currentOnline);

} catch(e) {
    console.log(e)
}
