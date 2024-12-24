const Appointment = require('../models/AppointmentSchema');
const Transaction = require('../models/Transaction');
const Barbershop = require('../models/BarbershopSchema');
const Barber = require('../models/BarberSchema');
const Service = require('../models/Service');
const MonthlyReport = require('../models/MonthlyReport');
const { getAvailableSlots, isSlotTaken } = require('../services/availability');
const { availableSlots } = require('../services/availableSlots');

const createAppointment = async (req, res) => {
    try {
        const { barber, services, client_name, barbershop, date, hour, status } = req.body;

        const existingBarbershop = await Barbershop.findById(barbershop);
        if (!existingBarbershop) {
            return res.status(404).json({ message: 'Barbearia não encontrada' });
        }

        const existingBarber = await Barber.findById(barber);
        if (!existingBarber) {
            return res.status(404).json({ message: 'Barbeiro não encontrado' });
        }

        const retrievedAvailableSlots = await availableSlots(barber, date);

        if (!retrievedAvailableSlots.includes(hour)) {
            return res.status(400).json({ error: 'Horário inválido' });
        }

        const servicesDetails = await Service.find({ '_id': { $in: services } });

        let totalDuration = 0;
        servicesDetails.forEach(service => {
            totalDuration += service.duration;  // Soma as durações dos serviços
        });

        const newAppointment = new Appointment({ barber, service: services, client_name, barbershop, date, hour, duration: totalDuration, status });
        await newAppointment.save();
        res.status(201).json(newAppointment);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Erro ao criar agendamento' });
    }
};

const deleteAppointment = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedTransaction = await Transaction.find({ appointment: id });

        if (deletedTransaction.length > 0) {
            // Excluir todas as transações associadas ao agendamento
            await Transaction.deleteMany({ appointment: id });
            console.log('Transações excluídas com sucesso');
        }

        // Search and delete the appointment by ID
        const deletedAppointment = await Appointment.findByIdAndDelete(id);

        if (!deletedAppointment) {
            return res.status(404).json({ error: 'Agendamento não encontrado' });
        }

        res.status(200).json({ message: 'Agendamento excluído com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao excluir agendamento' });
    }
};

const updateAppointment = async (req, res) => {
    const { id } = req.params;
    const { barbershopId, barber, services, client_name, barbershop, date, hour, status, paymentStatus } = req.body;

    try {
        // Search the appointment by ID
        const appointment = await Appointment.findById(id).populate('service');

        if (!appointment) {
            return res.status(404).json({ error: 'Agendamento não encontrado' });
        }

        // Update field of appointment
        if (barber) appointment.barber = barber;
        if (services) appointment.service = services;
        if (client_name) appointment.client_name = client_name;
        if (barbershop) appointment.barbershop = barbershop;
        if (date) appointment.date = date;
        if (hour) appointment.hour = hour;
        if (paymentStatus) appointment.paymentStatus = paymentStatus;

        // If field 'status' was updated
        if (status) {
            appointment.status = status;

            if (status === 'Concluído') {
                const totalPrice = appointment.service.reduce((total, service) => total + service.price, 0);

                // Create a transaction with total value of services
                const newTransaction = new Transaction({
                    type: "servico",
                    appointment: appointment._id,
                    barber: appointment.barber,
                    barbershop: appointment.barbershop,
                    amount: totalPrice,
                    paymentStatus: paymentStatus,
                    date: appointment.date
                });

                await newTransaction.save();

                const year = new Date().getFullYear();
                const month = new Date().getMonth() + 1;
                const type = "servico";

                // let monthlyReport = await MonthlyReport.findOne({ barbershop: barbershopId, year, month });
                // console.log(monthlyReport);
                // if (!monthlyReport) {
                //     monthlyReport = new MonthlyReport({
                //         barbershop: barbershopId,
                //         year,
                //         month,
                //         totalBarbershop: 0,
                //         totalService: 0,
                //         totalProduct: 0
                //     });
                //     await monthlyReport.save();
                // }

                await MonthlyReport.findOneAndUpdate(
                    { barbershop: barbershopId, year, month },
                    {
                        $inc: {
                            totalBarbershop: totalPrice,
                            totalServiceAmount: type === 'servico' ? totalPrice : 0,
                            totalServiceQuantity: type === 'servico' ? appointment.service.length : 0,
                        }
                    },
                    { new: true }
                );
            }
        }

        await appointment.save();

        res.status(200).json(appointment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar o agendamento' });
    }
};

const getAppointmentsByDate = async (req, res) => {
    const { startDate, endDate } = req.query;
    const { barbershopId } = req.params;

    // Validação de formato de data
    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
    }

    try {
        // Converte as datas para o formato de Date
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Verifica se as datas são válidas
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        // Busca os agendamentos dentro do intervalo de datas
        const appointments = await Appointment.find({
            barbershop: barbershopId,
            date: {
                $gte: start, // Maior ou igual a startDate
                $lte: end    // Menor ou igual a endDate
            }
        }).populate('barber').populate('service').populate('barbershop'); // Popula os dados relacionados, como barbearia, barbeiro e serviços

        res.status(200).json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao recuperar os agendamentos' });
    }
};

const getallAppointments = async (req, res) => {
    const { barbershopId } = req.params;

    try {
        const appointments = await Appointment.find({
            barbershop: barbershopId
        }).populate('barber').populate('service').populate('barbershop');

        res.status(200).json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao recuperar os agendamentos' });
    }
};


module.exports = {
    createAppointment,
    deleteAppointment,
    updateAppointment,
    getAppointmentsByDate,
    getallAppointments
}