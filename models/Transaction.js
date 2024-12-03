const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
    type: {
        type: String,
        enum: ['servico', 'produto', 'despesa'],
        required: true
    },
    appointment: {
        type: Schema.Types.ObjectId,
        ref: 'Appointment',
        required: function() { return this.type === 'servico'; }
    },
    description: {
        type: String
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: function() { return this.type === 'produto'; }
    },
    barber: {
        type: Schema.Types.ObjectId,
        ref: 'Barber',
        required: function() { return this.type === 'produto'; }
    },
    barbershop: {
        type: Schema.Types.ObjectId,
        ref: 'Barbershop',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    quantity: {
        type: Number,
        required: function() { return this.type === 'produto'; }
    },
    amount: {
        type: Number,
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
}, { collection: 'Transaction' });

module.exports = mongoose.model('Transaction', TransactionSchema);