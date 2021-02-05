const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');
const jwt = require('jsonwebtoken');

const Booking = require('../models/booking');
const Advert = require('../models/advert');

router.get('/', (req, res, next) => {
    Booking.find()
    .populate('renter', '-_id -password')
    .populate('advert')
    .populate({
        path: 'advert',
        populate: { path: 'cabin poster', select: '-_id -password' }
    })
    .populate({
        path: 'advert',
        populate: {
            path: 'cabin',
            populate: { path: 'owner', select: '-_id -password' }
        }
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
});


router.get('/:id', (req, res, next) => {
    
    const id = req.params.id;
    
    Booking.findById(id)
        .populate('Booking')
        .populate('renter', '-_id -password')
        .populate('advert')
        .populate({
            path: 'advert',
            populate: { path: 'cabin poster', select: '-_id -password' }
        })
        .populate({
            path: 'advert',
            populate: {
                path: 'cabin',
                populate: { path: 'owner', select: '-_id -password' }
            }
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

.post('/' , checkAuth.checkLogin(), (req, res, next) => {
    var isOk = false;

    // Hämtar annons objektet med annons id
    Advert.find({ _id: req.body.advert }).exec()
        .then(document => {

            // när stugan kan bokas
            const fromTreshold = new Date(document[0].availability.from);
            const toTreshold = new Date(document[0].availability.to);


            if(document.length > 0) {


                // datum som användaren vill boka
                const from = new Date(req.body.booking.from);
                const to = new Date(req.body.booking.to);


                // söker bokningar för samma annons
                Booking.find({ advert: req.body.advert }).exec()
                    .then(result => {
                        if(result.length > 0) {

                            //loopar genom alla bokningar
                            for(var i = 0; i < result.length; i++) {
                                const fromOther = new Date(result[i].booking.from);
                                const toOther = new Date(result[i].booking.to);

                                //om bokningarna överlappar
                                if(toOther >= from && fromOther <= to) {
                                    isOk = false; // går inte att boka
                                    break;
                                } else {
                                    isOk = true; // går att boka (bokningar överlappar inte)
                                }
                            }
                        } else {
                            isOk = true; // går att boka (inga andra bokningar för annonsen)
                        }


                        // om bokningen går utanför stugans tillgänglighet
                        if(from < fromTreshold || to > toTreshold) {
                            res.status(201).json({
                                message: "Stugan går inte att boka under det givna tidsintervallet."
                            });
                        } else if(isOk) {

                            const decoded = jwt.verify(req.session.token, "secret");

                            const booking = new Booking({
                                _id: new mongoose.Types.ObjectId(),
                                advert: req.body.advert,
                                booking: req.body.booking,
                                renter: decoded.userId
                            });
                        
                            booking.save()
                                .then(result => {
                                    res.status(201).json({
                                        message : "Booking successfully created!",
                                        booking: booking 
                                    });
                                })
                                .catch(error => {
                                    console.log(error);
                                    const err = new Error(error);
                                    err.status = error.status || 500;
                                    next(err);
                                });
                        } else {
                            res.status(201).json({
                                message: "Stugan går inte att boka under det givna tidsintervallet."
                            });
                        }
                        
                        
                    })
                    .catch(error => {
                        console.log(error);
                        const err = new Error(error);
                        err.status = error.status || 500;
                        
                        next(err);
                    });

            } else {
                res.status(200).json({
                    message: "Could not find advert with id " + req.body.advert + "."
                });
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

    Booking.find({_id: id}).exec()
    
    .then(document => {
        if (document.length > 0) {

            if (document[0].renter == decoded.userId) {

                Booking.remove({_id: id}).exec()

                .then(() => {
                    res.status(200).json({
                        message: "Booking deleted",
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
                    message: "The reservation is not yours"
                })
            }
        } else {
            res.status(404).json({
                message: "Booking not found"
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

    Booking.find({_id: id}).exec()
    
    .then(document => {
        if (document.length > 0) {

            if (document[0].renter == decoded.userId) {

                Booking.update({_id: req.params.id}, {$set: req.body}).exec()

                .then(() => {
                    res.status(200).json({
                        message: "booking updated!"
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
                    message: "The reservation is not yours"
                })
            }
        } else {
            res.status(404).json({
                message: "Booking not found"
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