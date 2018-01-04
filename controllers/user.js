'use strict';

module.exports = function(_, passport, User){
    return{
        setRouting: function(router){
            router.get('/', this.indexPage);
            router.get('/register', this.registerPage);
            router.get('/auth/facebook', this.facebookAuth);
            router.get('/auth/facebook/callback', this.facebookAuthSuccess);
            router.get('/auth/google', this.googleAuth);
            router.get('/auth/google/callback', this.googleAuthSuccess);

            router.post('/register', User.RegisterValidation, this.registerPost);
            router.post('/', User.LoginValidation, this.loginPost);
        },

        indexPage: function(req, res){
            const errors = req.flash('error');
            return res.render('index', {title: 'WebChat | Login', messages: errors, hasErrors: errors.length > 0});
        },

        registerPage: function(req, res){
            const errors = req.flash('error');
            return res.render('register', {title: 'WebChat | Register', messages: errors, hasErrors: errors.length > 0});
        },

        registerPost: passport.authenticate('local.register', {
            successRedirect: '/home',
            failureRedirect: '/register',
            failureFlash: true,
        }),

        loginPost: passport.authenticate('local.login', {
            successRedirect: '/home',
            failureRedirect: '/',
            failureFlash: true,
        }),

        facebookAuth: passport.authenticate('facebook', {
            scope: 'email',
        }),

        facebookAuthSuccess: passport.authenticate('facebook', {
            successRedirect: '/home',
            failureRedirect: '/',
            failureFlash: true,
        }),

        googleAuth: passport.authenticate('google', {
            scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read'],
        }),

        googleAuthSuccess: passport.authenticate('google', {
            successRedirect: '/home',
            failureRedirect: '/',
            failureFlash: true,
        }),
    }
};