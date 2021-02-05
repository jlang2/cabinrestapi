const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    advert: { type: String, ref: 'Advert', required: true },
    booking: {
        from: { type: Date, required: true },
        to: { type: Date, required: true }
    },
    renter: { type: String, ref: 'User' }
});

module.exports = mongoose.model('Booking', bookingSchema);