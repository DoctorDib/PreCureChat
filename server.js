const sha256 = require('js-sha256');
const express = require('express'),
    app = express(),
    path = require('path'),
    http = require('http').Server(app),
    io = require('socket.io')(http);
const MongoClient = require('mongodb').MongoClient;
let db;

app.use(express.static(path.join(__dirname, './www')));


function generateToken(uName, dName){
    return {
        token: sha256(dName+uName+(Math.floor((Math.random() * 1000000) + 1)).toString()),
        expiry: getDateTime(7)
    };
}

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

//==============================================================================
// MONGODB SETUP - Setting up MongoDB
//==============================================================================

MongoClient.connect("mongodb://localhost:27017/precureMaster", function(err, database) {

    if(err) return console.error(err);

    db = database;
    console.log("connected to " + db.s.databaseName);

});

//==============================================================================

async function checkValid(data){
    let res;
    await db.collection("user_collection").find(data).toArray(
        function(err, results) {
            res = results.length === 1;
        }
    );
    return res;
};

io.on('connection', function (socket) {
    console.log('TESTING THAT CONNECTION');

    socket.on('disconnect', function () {
        console.log('TESTING THAT LEAVING BOY');
    });

    socket.on('register_request', function(user){
        const uName = user.uName;
        const dName = user.dName;
        const email = user.email;
        let pass = user.pass;
        // Hashing it out.
        pass += sha256(uName);
        pass = sha256(pass);

        let token_set = generateToken(uName, dName);

        if(checkValid({"username": uName})){
            socket.emit('register_response', {'result':'fail', 'reason': 'Account already exists!'});
        } else {
            // Creating new user field.
            db.collection("user_collection").insert({
                "username": uName,
                "display_name": dName,
                "email": email,
                "password": pass,
                "picture": "www/UserData/img/default_pic.jpg",
                "servers": [],
                "user_status": 0,
                "create_date": new Date(),
                "token": token_set.token,
                "token_expiry": token_set.expiry
            });
            socket.emit('register_response', {'result':'success'});
        }
    });

    socket.on('login_request', function(user){
        const uName = user.uName;
        let pass = user.pass;
        // Hashing it out.
        pass += sha256(uName);
        pass = sha256(pass);

        if(checkValid({"username": uName, "password": pass})){
            socket.emit('login_response', {'result':'success'});
        } else {
            socket.emit('login_response', {'result':'fail', 'reason': 'Account not found!'});
        }
    });

    socket.on('token_login', function(token){
        if(checkValid({"token": token})){
            socket.emit('login_response', {'result':'success', 'token': token});
        } else {
            socket.emit('login_response', {'result':'fail', 'reason': 'Token not found!'});
        }
    });
	
});

http.listen(8080, function () {
    console.log('Launched on port 8080');
});
