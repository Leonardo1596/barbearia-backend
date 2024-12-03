const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BarbershopSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String
    },
    contact: {
        type: String,
    },
    monthlyFee: { type: Number, required: true },
    subscriptionStatus: {
        isPaid: { type: Boolean, default: false },
        dueDate: { type: Date },
        lastPaymentDate: { type: Date }
    },
    services: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    }],
    status: { type: String, enum: ['ativo', 'inativo'], default: 'ativo' },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { collection: 'Barbershop' });

module.exports = mongoose.model('Barbershop', BarbershopSchema);