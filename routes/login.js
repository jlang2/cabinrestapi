const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const checkAuth = require('../middleware/check-auth');

router.post('/', (req, res, next) => {
    User.find({email: req.body.email}).exec()
        .then(user => {
            if(user.length < 1) {
                res.status(401).json({
                     message: "Authentication failed (check your email and password)"
                });
            } else {
                bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                    if(err) {
                        res.status(401).json({
                            message: "Authentication failed (check your email and password)"
                        });
                    } else if(result) {
                        //Generera en JWT för användaren
                        const token = jwt.sign({
                                    email: user[0].email,
                                    userId: user[0]._id
                                }, 
                                "secret",
                                { expiresIn: "1h"});

                        req.session.loggedIn = true;
                        req.session.token = token;

                        res.status(200).json({
                            message: "Authenctication successful"
                        });
                    } else {
                        res.status(401).json({
                            message: "Authenctication failed"
                        });                       
                    }
                })
            }
        })
        .catch(error => {
            console.log(error);
            const err = new Error(error);
            err.status = error.status || 500;
            next(err);
        });
})

router.use((req, res, next) => {
    const error = new Error("Only POST command supported");
    error.status = 500;
    next(error);
});

module.exports = router;