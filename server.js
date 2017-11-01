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

//==============================================================================
// MONGODB SETUP - Setting up MongoDB
//==============================================================================

MongoClient.connect("mongodb://localhost:27017/precureMaster", function(err, database) {

    if(err) return console.error(err);

    db = database;
    console.log("connected to " + db.s.databaseName);

});

//==============================================================================

let checkAccount = function(data){
    db.user_collection.find(data).toArray(
        function(err, results) {
            return results.length;
        }
    );
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
        pass += sha256(sha256(uName));
        pass = sha256(pass);

        if(checkAccount({"username": uName})){
            socket.emit('register_response', {'result':'fail', 'reason': 'Account already exists!'});
        } else {
            // Creating new user field.
            db.user_collection.insert({
                "username": uName,
                "display_name": dName,
                "email": email,
                "password": pass,
                "picture": "www/UserData/img/default_pic.jpg",
                "servers": [],
                "user_status": 0,
                "create_date": new Date(),
                "token": generateToken(uName, dName)
            });
            socket.emit('register_response', {'result':'success'});
        }
    });

    socket.on('login_request', function(user){
        const uName = user.uName;
        let pass = user.pass;
        // Hashing it out.
        pass += sha256(sha256(uName));
        pass = sha256(pass);

        if(checkAccount({"username": uName, "password": pass})){
            socket.emit('login_response', {'result':'success'});
        } else {
            socket.emit('login_response', {'result':'fail', 'reason': 'Account not found!'});
        }
    });

    socket.on('token_login', function(token){
        if(checkAccount({"token": token})){
            socket.emit('login_response', {'result':'success', 'token': token});
        } else {
            socket.emit('login_response', {'result':'fail', 'reason': 'Token not found!'});
        }
    });
	
});

http.listen(8080, function () {
    console.log('Launched on port 8080');
});
