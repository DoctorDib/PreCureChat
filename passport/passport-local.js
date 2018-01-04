'use strict';

const passport = require('passport');
const User = require('../models/user');
const LocalStrategy = require('passport-local').Strategy;

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

passport.use('local.register', new LocalStrategy({
    usernameField: 'email',
    passportField: 'password',
    passReqToCallback: true,
}, (req, email, password, done) => {
    User.findOne({'email': email}, (err, user) => {
        if(err) {
            return done(err);
        }
        if(user){
            return done(null, false, req.flash('error', 'Email already in use'));
        }

        const newUser = new User();
        newUser.username = req.body.username;
        newUser.email = req.body.email;
        newUser.password = newUser.encryptPassword(req.body.password);
        newUser.save((err) => {
            done(null, newUser);
        });
    });
}));

passport.use('local.login', new LocalStrategy({
    usernameField: 'email',
    passportField: 'password',
    passReqToCallback: true,
    }, (req, email, password, done) => {
        User.findOne({'email': email}, (err, user) => {
            if(err) {
                return done(err);
            }

            const messages = [];
            if(!user || !user.validUserPassword(password)){
                messages.push('Incorrect email or password');
                return done(null, false, req.flash('error', messages));
            }

            return done(null, user);
    });
}));