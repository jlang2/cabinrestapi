const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');
const jwt = require('jsonwebtoken');

const Cabin = require('../models/cabin');


router.get('/', (req, res, next) => {
    Cabin.find().populate('owner', '-_id -password').exec()
        .then(documents => {
            res.status(200).json(documents);
        })
        .catch(error => {
            console.log(error);
            const err = new Error(error);
            err.status = error.status || 500;
            
            next(err);
        });
})

.get('/:id', (req, res, next) => {
    
    const id = req.params.id;
    
    Cabin.findById(id).populate('owner', '-_id -password').exec()
        .then(document => {
            res.status(200).json(document);
            
        })
        .catch(error => {
            console.log(error);
            const err = new Error(error);
            err.status = error.status || 500;
            
            next(err);
        });
})

.post('/', checkAuth.checkLogin(), (req, res, next) => {


    const decoded = jwt.verify(req.session.token, "secret");

    const cabin = new Cabin({
        _id: new mongoose.Types.ObjectId(),
        owner: decoded.userId,
        name: req.body.name,
        address: req.body.address,
        area: req.body.area,
        rooms: req.body.rooms,
        sauna: req.body.sauna,
        beach: req.body.beach
    });

    cabin.save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message : "Cabin successfully created!",
                Cabin: Cabin
            });
        })
        .catch(error => {
            console.log(error);
            const err = new Error(error);
            err.status = error.status || 500;
            
            next(err);
        });

})

.delete('/:id', checkAuth.checkLogin(), (req, res, next) => {

    const id = req.params.id;
    const decoded = jwt.verify(req.session.token, "secret");

    Cabin.find({_id: id}).exec()
        .then(document => {

            console.log(document);

            if(document.length > 0) {

                if(decoded.userId == document[0].owner) {

                    Cabin.deleteOne({_id: id}).exec()
                        .then(() => {
                            res.status(200).json({
                                message: "Cabin deleted.",
                            })
                        })
                        .catch(error => {
                            console.log(error);
                            const err = new Error(error);
                            err.status = error.status || 500;
                            
                            next(err);
                        });
                } else {
                    res.status(403).json({
                        message: "You are not the owner of this post."
                    })
                }
            } else {
                res.status(404).json({
                    message: "Cabin not found"
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

.patch('/:id', checkAuth.checkLogin(), (req, res, next) => {
    const id = req.params.id;
    const decoded = jwt.verify(req.session.token, "secret");

    Cabin.findById(id).exec()
        .then(document => {

            if(document.length > 0) {

                if(decoded.userId == document.owner) {

                    Cabin.updateOne({_id: id}, { $set: req.body }).exec()
                        .then(() => {
                            res.status(200).json({
                                message: "Cabin updated.",
                            })
                        })
                        .catch(error => {
                            console.log(error);
                            const err = new Error(error);
                            err.status = error.status || 500;
                            
                            next(err);
                        });
                } else {
                    res.status(403).json({
                        message: "You are not the owner of this post."
                    })
                }
            } else {
                res.status(404).json({
                    message: "Cabin not found"
                })
            }
        })
        .catch(error => {
            console.log(error);
            const err = new Error(error);
            err.status = error.status || 500;
            
            next(err);
        });
});

router.use((req, res, next) => {
    const error = new Error("Only GET, POST, PATCH, DELETE commands supported");
    error.status = 500;
    next(error);
});

module.exports = router;

