const Appointment = require('../models/AppointmentSchema');
const { getAvailableSlots } = require('../services/availability');

const availableSlots = async (barberId, date) => {
    // const { barber, date } = req.params
    const localDate = new Date(`${date}T00:00:00`);

    // Fetch all conflicting appointments for the barber on the selected date
    const conflictingAppointments = await Appointment.find({
        barber: barberId,
        status: "Agendado",
        date: {
            $gte: new Date(new Date(localDate).setUTCHours(0, 0, 0, 0)),  // Start of the day (00:00:00)
            $lt: new Date(new Date(localDate).setUTCHours(23, 59, 59, 999))  // End of the day (23:59:59)
        }
    });

    let conflictingSlots = [];

    // Function to generate conflicting time slots based on the appointment start time and duration
    function generateConflictingSlots(startTime, duration) {
        let [hour, minute] = startTime.split(':').map(Number); // Split hour and minute
        const start = new Date(0, 0, 0, hour, minute); // Create a Date object with the start time

        // Calculate the end time based on the duration
        const end = new Date(start.getTime() + (duration + 10) * 60000); // End time after duration (for slots after)

        // Calculate the start time for before the appointment
        const startBefore = new Date(start.getTime() - 40 * 60000); // Start time before the appointment

        let currentBefore = new Date(startBefore);
        let currentAfter = new Date(start);

        // Add slots before the scheduled time
        while (currentBefore < start) {
            const hours = String(currentBefore.getHours()).padStart(2, '0');
            const minutes = String(currentBefore.getMinutes()).padStart(2, '0');
            conflictingSlots.push(`${hours}:${minutes}`);
            currentBefore.setMinutes(currentBefore.getMinutes() + 10); // 10-minute interval
        }

        // Add slots after the scheduled time
        while (currentAfter < end) {
            const hours = String(currentAfter.getHours()).padStart(2, '0');
            const minutes = String(currentAfter.getMinutes()).padStart(2, '0');
            conflictingSlots.push(`${hours}:${minutes}`);
            currentAfter.setMinutes(currentAfter.getMinutes() + 10); // 10-minute interval
        }
    }

    // Generate conflicting slots for all appointments
    conflictingAppointments.forEach((appointment) => {
        generateConflictingSlots(appointment.hour, appointment.duration);
    });

    // Fetch available slots for the barber on the selected date
    const availableSlots = await getAvailableSlots(barberId, date);

    // Filter the available slots by removing the conflicting ones
    const filteredSlots = availableSlots.filter(slot => !conflictingSlots.includes(slot));
    return filteredSlots;
};

module.exports = { availableSlots };