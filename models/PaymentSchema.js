const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
    barbershop: {
        type: Schema.Types.ObjectId,
        ref: 'Barbershop',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pago', 'pendente'],
        default: 'pendente'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { collection: 'Payment' });

module.exports = mongoose.model('Payment', PaymentSchema);