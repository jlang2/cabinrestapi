const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/check-auth');

const Advert = require('../models/advert');
const Cabin = require('../models/cabin');

router.get('/', (req, res, next) => {
    Advert.find()
    .populate('poster', '-_id -password')
    .populate('cabin')
    .populate({
        path: 'cabin',
        populate: { path: 'owner', select: '-_id -password' }
    })
    .exec()
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
    
    Advert.findById(id)
        .populate('Advert')
        .populate('poster', '-_id -password')
        .populate('cabin')
        .populate({
            path: 'cabin',
            populate: { path: 'owner', select: '-_id -password' }
        })
        .exec()
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


    // req.body.cabin == cabinId
    // hitta stugan med rätt id
    Cabin.findById(req.body.cabin).exec()
        .then(document => {


            // kollar att inloggade användaren äger stugan
            if(document.owner == decoded.userId) {

            const advert = new Advert({
                _id: new mongoose.Types.ObjectId(),
                cabin: req.body.cabin, // cabinId
                poster: decoded.userId, // inloggade användarens id
                availability: req.body.availability
            });
        
            advert.save()
                .then(result => {
                    console.log(result);
                    res.status(201).json({
                        message : "Advert successfully created!",
                        advert: advert
                    });
                })
                .catch(error => {
                    console.log(error);
                    const err = new Error(error);
                    err.status = error.status || 500;
                    
                    next(err);
                });
            } else {
                res.status(403).json({
                    message: "You are not the owner of the cabin chosen."
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

.delete('/:id', checkAuth.checkLogin(), (req, res, next) => {

    const id = req.params.id;
    const decoded = jwt.verify(req.session.token, "secret");

    Advert.find({_id: id}).exec()

    .then(document => {

        if(document.length > 0) {

            if(document[0].poster == decoded.userId) {

                Advert.remove({_id: id}).exec()
                
                .then(() => {
                    res.status(200).json({
                        message: "Advert deleted.",
                    })
                })
                .catch(error => {
                    console.log(error);
                    const err = new Error(error);
                    err.status = error.status || 500;
                    
                    next(err);
                });
            }
        } else {
            res.status(404).json({
                message: "Could not find advert"
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

    Advert.find({_id: id}).exec()

    .then(document => {
        if(document.length > 0) {

            if(document[0].poster == decoded.userId) {

                Advert.updateOne({_id: id}, {$set: req.body}).exec()

                .then(() => {
                    res.status(200).json({
                        message: "Advert updated!"
                    });
                })
                .catch(error => {
                    console.log(error);
                    const err = new Error(error);
                    err.status = error.status || 500;
                    
                    next(err);
                });
            } else {
                res.status(403).json({
                    message: "You are not the poster of this advert."
                })
            }
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
