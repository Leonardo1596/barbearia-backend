const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: { type: String, required: true },
    barbershop: {
        type: Schema.Types.ObjectId,
        ref: 'Barbershop',
        required: function () {
            return this.role !== 'admin';
        }
    },
    role: {
        type: String,
        enum: ['gerente', 'admin']
    },
    contactInfo: {
        phone: String
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { collection: 'User' });

module.exports = mongoose.model('User', UserSchema);