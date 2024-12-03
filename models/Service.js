const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServiceSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    duration: { type: Number, required: true },
    price: {
        type: Number,
        required: true
    },
    barbershop: {
        type: Schema.Types.ObjectId,
        ref: 'Barbershop',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { collection: 'Service' });

module.exports = mongoose.model('Service', ServiceSchema);