const mongoose = require('mongoose');

const advertSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    cabin: { type : String, ref: 'Cabin', required: true },
    poster: { type: String, ref: 'User', required: true },
    availability: {
        from: { type: Date, required: true },
        to: { type: Date, required: true }
    }
});

module.exports = mongoose.model('Advert', advertSchema);