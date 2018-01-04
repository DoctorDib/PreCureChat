'use strict';

module.exports = function(){
    return {
        RegisterValidation: (req, res, next) => {
            req.checkBody('username', 'Username is required').notEmpty();
            req.checkBody('username', 'Username must be 3 characters or more').isLength({min: 3});

            req.checkBody('email', 'Email is required').notEmpty();
            req.checkBody('email', 'Email is invalid').isEmail();

            req.checkBody('password', 'Password is required').notEmpty();
            req.checkBody('password', 'Password must be 6 characters or more').isLength({min: 6});

            req.getValidationResult()
                .then((result) => {
                const errors = result.array();
                const messages = [];
                errors.forEach((error) => {
                    messages.push(error.msg);
                });
                req.flash('error', messages);
                res.redirect(('/register'));
                })
                .catch((err) => {
                    return next();
                });
        },

        LoginValidation: (req, res, next) => {

            req.checkBody('email', 'Input your email').notEmpty();
            req.checkBody('email', 'Input a valid email').isEmail();
            req.checkBody('password', 'Input your password').notEmpty();

            req.getValidationResult()
                .then((result) => {
                    const errors = result.array();
                    const messages = [];
                    errors.forEach((error) => {
                        messages.push(error.msg);
                    });
                    req.flash('error', messages);
                    res.redirect(('/'));
                })
                .catch((err) => {
                    return next();
                });
        }
    }
};