const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const http = require('http');
const cookieParser = require('cookie-parser');
const validator = require('express-validator');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const flash = require('connect-flash');
const passport = require('passport');
const dependencies = require('./dependencies');


dependencies.resolve(function(user, _, admin, home){
    const app = SetupExpress();

    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://localhost/webchat', {useMongoClient: true});

    function SetupExpress(){
        const app = express();
        const server = http.createServer(app);
        server.listen(3000, function(){
            console.log('Listening on port 3000');
        });

        configureExpress(app);

        // Setup Router/Routing
        const router = require('express-promise-router')();
        user.setRouting(router);
        admin.setRouting(router);
        home.setRouting(router);
        app.use(router);
    }

    function configureExpress(app){
        require('./passport/passport-local');
        require('./passport/passport-facebook');
        require('./passport/passport-google');

        app.use(express.static('public'));
        app.use(cookieParser());
        app.set('view engine', 'ejs');
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(validator());
        app.use(session({
            secret: 'supersecretkey',
            resave: true,
            saveInitializes: true,
            store: new MongoStore({mongooseConnection: mongoose.connection}),
        }));
        app.use(flash());
        app.use(passport.initialize());
        app.use(passport.session());
        app.locals._ = _;
    }

});