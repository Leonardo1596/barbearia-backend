const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppointmentSchema = new Schema({
    client_name: {
        type: String,
        required: true
    },
    barber: {
        type: Schema.Types.ObjectId,
        ref: 'Barber',
        required: true
    },
    barbershop: {
        type: Schema.Types.ObjectId,
        ref: 'Barbershop',
        required: true
    },
    service: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true }],
    date: {
        type: Date,
        required: true
    },
    hour: {
        type: String,
        required: true
    },
    duration: { type: Number, required: false },
    appointmentEndTime: { type: Date },
    status: {
        type: String,
        enum: ['Agendado', 'Concluído', 'Cancelado'],
        default: 'Agendado'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { collection: 'Appointment' });

module.exports = mongoose.model('Appointment', AppointmentSchema);