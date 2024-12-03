const Appointment = require('../models/AppointmentSchema');  // Modelo do agendamento
const Barber = require('../models/BarberSchema');  // Modelo do barbeiro
const { generateTimeSlots } = require('../utils/generateTimeSlots');

const getAvailableSlots = async (barberId, date) => {
    try {
        const barber = await Barber.findById(barberId);  // Find the barber

        if (!barber) {
            throw new Error('Barber not found');
        }

        const dateUTC = new Date(Date.UTC(
            parseInt(date.substring(0, 4)),  // Ano
            parseInt(date.substring(5, 7)) - 1,  // Mês
            parseInt(date.substring(8, 10))  // Dia
        ));
        dateUTC.setUTCHours(12, 0, 0, 0);
        const localDate = new Date(dateUTC);

        const barberSchedule = barber.schedule.find(sch => sch.day === new Date(localDate).toLocaleString('pt-BR', { weekday: 'long' }));

        if (!barberSchedule) {
            throw new Error('Barber has no available schedule on this day');
        }

        const startHour = barberSchedule.startTime
        const endHour = barberSchedule.endTime

        const startOfDay = new Date(`${date}T00:00:00.000Z`);
        const endOfDay = new Date(`${date}T23:59:59.999Z`);

        // Fetch appointments already made on this day
        const appointments = await Appointment.find({
            barber: barberId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        // Generate all possible time slots for the barber on this day
        const availableSlots = generateTimeSlots(startHour, endHour, 10);

        return availableSlots;

    } catch (error) {
        throw new Error(error.message);
    }
};


module.exports = { getAvailableSlots };
