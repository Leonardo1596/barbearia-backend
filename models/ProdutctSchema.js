const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    barbershop: {
        type: Schema.Types.ObjectId,
        ref: 'Barbershop',
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, { collection: 'Product' });

module.exports = mongoose.model('Product', productSchema);