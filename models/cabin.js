const mongoose = require('mongoose');

const cabinSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    owner: { type: String, ref: 'User' },
    name: String,
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    address: {type: String, required: true },
    area: { type: Number, required: true },
    rooms: { 
        bedrooms: Number,
        sauna: Boolean,
        kitchen: Boolean,
        bathrooms: Number
    },
    beach: { type: Boolean, default: false }
});

module.exports = mongoose.model('Cabin', cabinSchema);