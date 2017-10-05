//Hashing algorithm
var sha256 = require('js-sha256');
var msgFormat = require('./messageFormat');

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

// =====================================================================================================
// DATABSE SETUP
// =====================================================================================================

var Pool = require('pg').Pool;
var config = {
    host: 'localhost',
    user: 'postgres',
    password: 'HappyObeseDuck74',
    database: 'database_master'
};

var pool = new Pool(config);

// ======================================================================================================
// DATABASE FUNCTIONS
// =====================================================================================================
var signupNS = io.of('/login');
signupNS.on('connection', function(socket){
    console.log(socket.id);
    socket.on('registerAccount', function(uDetails){
        create_account(uDetails);
    });

    socket.on('login', async function(uDetails){
        var dName = await login_account(uDetails);
        if(dName !== false){
            socket.emit('doLogin', dName);
        }
    });

    socket.on('testing', function(){
        console.log('AAAAAAAAAAAAAAAAAAAAA');
    });

    socket.on('tokenLogin', async function(token){
        var uData = await checkToken(token);
        if(uData !== false){
            socket.emit('doLogin', uData);
        } else {
            return false;
        }
    });
});

function generateToken(uName, dName){
    return {
        token: sha256(dName+uName+(Math.floor((Math.random() * 1000000) + 1)).toString()),
        expiry: getDateTime(7)
    };
}

/*var d = new Date();
document.getElementById("demo").innerHTML = d.getTime();*/

function getDateTime(increase) {

    var date = new Date();

    date.setDate(date.getDate() + increase);

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;

}

async function checkToken(token){
    try {
        var tokenExpire = getDateTime(0);
        const queryText = 'SELECT display_name, id FROM user_collection WHERE token = $1 AND token_expire > $2::timestamp;';
        const values = [token.token, tokenExpire];
        const res = await pool.query(queryText, values);

        setOnline(res.rows[0].id, true);

        if(res.rowCount === 1){
            return {
                uName: res.rows[0].display_name,
                uID: res.rows[0].id,
                token: token.token,
                tokenExpire: tokenExpire
            };
        } else {
            return false;
        }
    } catch(e) {
        return false;
    }
}

async function setOnline(id, online){
    try {

        const queryText = 'UPDATE user_collection SET is_online = $2 WHERE id = $1;';
        const values = [id, online];

        const res = await pool.query(queryText, values);

    } catch(e) {
        console.log(e);
    }
}

async function create_account(userDetails){
    var uName = userDetails.userN;
    var dName = userDetails.userD;
    var email = userDetails.userE;
    var pWord = userDetails.userP;
    var token = generateToken(uName, dName);
    pWord += sha256(sha256(uName));
    pWord = sha256(pWord);
    try {
        const checkerQueryText = 'SELECT * FROM user_collection WHERE username=$1 OR email=$2;';
        const checkerValues = [uName, email];
        const check = await pool.query(checkerQueryText, checkerValues);
        if(check.rowCount === 0) {
            const queryText = 'INSERT INTO user_collection (username, password, email, create_date, display_name, token, token_expire) VALUES($1, $2, $3, NOW(), $4, $5, $6);';
            const values = [uName, pWord, email, dName, token.token, token.expiry];
            const res = await pool.query(queryText, values);
            return true;
        } else {
            return false;
        }
    } catch(e) {
        console.log(e.stack);
    }
}


// CHANGING PASSWORD
//      |
//      |
//      |
//      |
//      |
//      v
// UPDATE user_collection SET password = newpass WHERE username = username;   <--------- CHANGING PASSWORD
//      ^
//      |
//      |
//      |
//      |
//      |
// CHANGING PASSWORD

async function login_account(userDetails){
    var uName = userDetails.userN;
    var pWord = userDetails.userP;
    pWord += sha256(sha256(uName));
    pWord = sha256(pWord);

    try {
        const queryText = 'SELECT display_name, id FROM user_collection WHERE username = $1 AND password = $2;';
        const values = [uName, pWord];
        const res = await pool.query(queryText, values);
        if(res.rowCount === 1){
            var uID = res.rows[0].id;
            var token = await generateToken(uName, uName);
            const queryText = 'UPDATE user_collection SET token = $1, token_expire = $2 WHERE id = $3';
            const values = [token.token, token.expiry, uID];

            setOnline(uID, true);



            const res2 = await pool.query(queryText, values);
            return {
                uName: res.rows[0].display_name,
                uID: res.rows[0].id,
                token: token.token,
                tokenExpire: token.expiry
            };
        } else {
            return false;
        }
    } catch(e) {
        console.log(e.stack);
        return false;
    }
}
// =====================================================================================================




var listedPeople = [];
var currentOnline = [];

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});


io.on('connection', function(socket){
    console.log('New Connection!');

    socket.on('searchUser', async function(data){
        const queryText = 'SELECT id FROM user_collection WHERE username = $1;';
        const values = [data];
        const res = await pool.query(queryText, values);

        var userid = res.rows[0].id;

        console.log(userid)

        socket.emit('userdata', userid)

    });


    socket.on('testing', function(a){
        console.log('sdfgsdflkjdhflkjghsldkfjghlkhsjdfhlgksjdflkgsjdhflkhjg');
    });

    socket.on('login', function(a){
        console.log('sdfgsdflkjdhflkjghsldkfjghlkhsjdfhlgksjdflkgsjdhflkhjg');
    });

    socket.on('chat message', function(msg){
        msg.msg = msgFormat.parseMessage(msg.msg);
        io.emit('chat message', msg);
    });

    socket.on('typing', function(msg){
        io.emit('typing', msg);
    });

    socket.on('newUserConnection', function(msg){
        console.log(msg);
        try {
            console.log("HFLGSLDKFLASDKFLSghdfghdfghdfghdfghdfghdfghdfghdfghdfghdfghdfghdfghdfghDKFLKL")
            var socketId = socket.id;
            var ip = socket.request.connection.remoteAddress;

            ip = ip.split(':').pop();

            listedPeople.push({'id':socketId, 'name':msg});

            var clientData = {'id':socketId, 'name':msg};

            io.emit('people', currentOnline);// + ' == = == ' + currentOnline.length);

            console.log("[New Connection: " + "  -  " + msg + "  -  " + socketId + ']');
        } catch(e){
            console.log(e);
        }
    });

    //io.emit('people', currentOnline + ' == = == ' + currentOnline.length);

    socket.on('disconnect', async function(socket){

        var clients = Object.keys(io.sockets.connected);
        var onlineCache = currentOnline;
        currentOnline = [];
        var onlinePeople = listedPeople;

        //io.emit('debug', socket);

        try {
            //setOnline(id, false);

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

                    const queryText = 'SELECT id FROM user_collection WHERE username = $1';
                    const values = [listedPeople[x].name];

                    var results = await pool.query(queryText, values);
                    var id = results.rows[0].id;
                    console.log(id)

                    setOnline(id, false);



                    break;
                }
            }
            listedPeople = currentOnline;
        } catch (e) { console.log(e)
        }

        io.emit('people', currentOnline);// + ' == = == ' + currentOnline.length);

    });


});



Server.listen(443, 'precure.ddns.net');
