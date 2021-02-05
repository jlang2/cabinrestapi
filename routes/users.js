const express = require('express');
const router = express.Router();
const User = require('../models/user');
const checkAuth = require('../middleware/check-auth');
const jwt = require('jsonwebtoken');


router.get('/', checkAuth.checkLogin(), (req, res, next) => {

    const decoded = jwt.verify(req.session.token, "secret");


    User.find().exec()
    
    .then(result => {
        res.status(200).json(result);
    })
    .catch(error => {
        console.log(error);
        const err = new Error(error);
        err.status = error.status || 500;
        
        next(err);
    });
});

router.use((req, res, next) => {
    const error = new Error("Only GET command supported");
    error.status = 500;
    next(error);
});

module.exports = router;