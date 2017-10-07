// =====================================================================================================================
// SETUP
// =====================================================================================================================
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

// =====================================================================================================================
// DATABSE SETUP
// =====================================================================================================================

var Pool = require('pg').Pool;
var config = {
    host: 'localhost',
    user: 'postgres',
    password: 'HappyObeseDuck74',
    database: 'database_master'
};

var pool = new Pool(config);

// =====================================================================================================================
// DATABASE FUNCTIONS
// =====================================================================================================================
var signupNS = io.of('/login');
signupNS.on('connection', function(socket){
    // console.log(socket.id);
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
// =====================================================================================================================
// TOKENS
// =====================================================================================================================

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
        const queryText = 'SELECT username, display_name, id FROM user_collection WHERE token = $1 AND token_expire > $2::timestamp;';
        const values = [token.token, tokenExpire];
        const res = await pool.query(queryText, values);

        setOnline(res.rows[0].id, 1);

        if(res.rowCount === 1){
            return {
                username: res.rows[0].username,
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
// =====================================================================================================================
// SETTING ONLINE
// =====================================================================================================================
async function setOnline(id, online){
    try {

        const queryText = 'UPDATE user_collection SET user_status = $2 WHERE id = $1;';
        const values = [id, online];

        const res = await pool.query(queryText, values);

    } catch(e) {
    }
}
// =====================================================================================================================
// CREATE ACCOUNT
// =====================================================================================================================

async function create_account(userDetails){
    var uName = userDetails.userN;
    var dName = userDetails.userD;
    var email = userDetails.userE;
    var pWord = userDetails.userP;
    var token = generateToken(uName, dName);
    pWord += sha256(sha256(uName));
    pWord = sha256(pWord);
    try {
        const checkerQueryText = 'SELECT * FROM user_collection WHERE LOWER(username)=LOWER($1) OR email=$2;';
        const checkerValues = [uName, email];
        const check = await pool.query(checkerQueryText, checkerValues);
        if(check.rowCount === 0) {
            const defaultImg = '../UserData/img/default_pic.jpg';
            const queryText = 'INSERT INTO user_collection (username, password, email, create_date, display_name, token, token_expire, picture) VALUES($1, $2, $3, NOW(), $4, $5, $6, $7);';
            const values = [uName, pWord, email, dName, token.token, token.expiry, defaultImg];
            const res = await pool.query(queryText, values);
            return true;
        } else {
            return false;
        }
    } catch(e) {
        console.log(e.stack);
    }
}
// =====================================================================================================================


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

// =====================================================================================================================
// USER LOGIN
// =====================================================================================================================
async function login_account(userDetails){
    var uName = userDetails.userN;
    var pWord = userDetails.userP;
    pWord += sha256(sha256(uName));
    pWord = sha256(pWord);

    try {
        const queryText = 'SELECT username, display_name, id FROM user_collection WHERE username = $1 AND password = $2;';
        const values = [uName, pWord];
        const res = await pool.query(queryText, values);
        if(res.rowCount === 1){
            var uID = res.rows[0].id;
            var token = await generateToken(uName, uName);
            const queryText = 'UPDATE user_collection SET token = $1, token_expire = $2 WHERE id = $3';
            const values = [token.token, token.expiry, uID];

            setOnline(uID, 1);



            const res2 = await pool.query(queryText, values);
            return {
                username: res.rows[0].username,
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
// =====================================================================================================================
// PRIVATE CHAT ROOM
// =====================================================================================================================

var rooms = [];
function Room(roomName){
    var room = io.of('/' + roomName);
    room.on('connection', function(socket){
        // console.log('Someone has connected to: ' + roomName);
        var socketCache = socket;
        console.log('New Connection!');

        // Calls when a users status changes
        socket.on('setStatus', async function(username, status){
            try{
                const queryText = "UPDATE user_collection SET user_status = $1 WHERE username=$2";
                const values = [status, username];
                const res = await pool.query(queryText, values);
            } catch(e){ console.log(e)
            }
        });

        // Calls when a user searches the user list
        socket.on('userSearch', async function(searchedU){
            try{
                const queryText = "SELECT username, display_name, picture, user_status FROM user_collection WHERE LOWER(username) LIKE LOWER($1) OR LOWER(display_name) LIKE LOWER($1)";
                const values = ['%'+searchedU+'%'];
                const res = await pool.query(queryText, values);
                socket.emit('listResults', res.rows);
            } catch(e){ console.log(e)
            }
        });

        // Calls when a user send a message
        socket.on('onMessage', function(msg){
            console.log('Message Recieved!');
            msg.msg = msgFormat.parseMessage(msg.msg);
            room.emit('onMessage', msg);
        });

        // Calls when a user types
        socket.on('typing', function(booleanType){
            room.emit('typing', booleanType);
        });

        // Calls when a user logs
        socket.on('login', async function(username){
            socket.username = username;
            room.emit('people', await getOnlineUsers());
            console.log(username + ' has logged into to: ' + roomName);
            console.log("[New Connection: " + "  -  " + username + "  -  " + socket.id + ']');
        });

        // Called when a user disconnects
        socket.on('disconnect', async function(socket){
            console.log('disconnect');
            console.log(socketCache.username);
            room.emit('people', await getOnlineUsers());
        });

        // Update user list
        async function updateList(){
            room.emit('people', await getOnlineUsers());
            setTimeout(updateList, 30000);
        }
        setTimeout(updateList, 30000);
    });
};

rooms.push(new Room('test'));
rooms.push(new Room('testicles'));

// =====================================================================================================================

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    // Calls when a user logs
    socket.on('leaveRoom', function(oldRoom, newRoom){
        socket.join('/' + newRoom);
        socket.leave('/' + oldRoom);
    });
});

async function getOnlineUsers(){
    const queryText = "SELECT username, display_name, picture, user_status FROM user_collection WHERE user_status != 0";
    const res = await pool.query(queryText);
    return res.rows
}

Server.listen(443, 'precure.ddns.net');
