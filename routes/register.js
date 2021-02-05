const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/user');



// hanterar förfrågningar riktade till adress:PORT/register
router.post('/', (req, res, next) => {
    
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
            res.status(500).json({
                message: err 
            });
        }  
        else {
            User.find({email: req.body.email}).exec()
                .then(documents => {
                    if (documents.length < 1) {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            firstname: req.body.firstname,
                            lastname: req.body.lastname,
                            email: req.body.email,
                            password: hash
                        });

                        user.save()
                            .then(result => {
                                res.status(201).json({
                                    message: "User registered!"
                                });
                            })
                            .catch(error => {
                                console.log(error);
                                const err = new Error(error);
                                err.status = error.status || 500;
                                
                                next(err);
                            });

                    } else {
                        res.status(200).json({
                            message: "E-mail already exists."
                        });
                    }


                })
                .catch(error => {
                    console.log(error);
                    const err = new Error(error);
                    err.status = error.status || 500;
                    
                    next(err);
                });
        
            
        }    
    });
});

router.use((req, res, next) => {
    const error = new Error("Only POST command supported");
    error.status = 500;
    next(error);
});


module.exports = router;