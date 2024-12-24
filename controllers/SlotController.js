const Appointment = require('../models/AppointmentSchema');
const { availableSlots } = require('../services/availableSlots');

const getAllAvailableSlots = async (req, res) => {
    const { barber, date } = req.params;

    const retrievedAvailableSlots = await availableSlots(barber, date);
    res.status(200).json(retrievedAvailableSlots);
};

module.exports = {
    getAllAvailableSlots
};