const mongoose = require('mongoose');

const BarberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    barbershop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Barbershop',  // Referência à barbearia onde o barbeiro trabalha
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    schedule: [{
        day: {
            type: String,  // Exemplo: 'segunda-feira', 'terça-feira', etc.
            enum: ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado', 'domingo']
        },
        startTime: {
            type: String,  // Exemplo: '09:00'
            required: true
        },
        endTime: {
            type: String,  // Exemplo: '18:00'
            required: true
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { collection: 'Barber' });

const Barber = mongoose.model('Barber', BarberSchema);

module.exports = Barber;