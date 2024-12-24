const Barber = require('../models/BarberSchema');

// Create a barber
const createBarber = async (req, res) => {
    try {
        const { name, barbershop, phone, schedule } = req.body;

        // Check if there is a barbershop
        if (!barbershop) {
            return res.status(400).json({ error: 'Barbearia não informada' });
        }

        // Create a new barber
        const newBarber = new Barber({
            name,
            barbershop,
            phone,
            schedule
        });

        await newBarber.save();
        res.status(201).json({ message: 'Barbeiro criado com sucesso', barber: newBarber });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar o barbeiro' });
    }
};

// Update a barber
const updateBarber = async (req, res) => {
    const { id } = req.params;
    const { name, phone, services, schedule } = req.body;

    try {
        // Procurar barbeiro pelo ID
        const barber = await Barber.findById(id);
        if (!barber) {
            return res.status(404).json({ error: 'Barbeiro não encontrado' });
        }

        // Update barber informations
        barber.name = name || barber.name;
        barber.phone = phone || barber.phone;
        barber.services = services || barber.services;
        barber.schedule = schedule || barber.schedule;

        await barber.save();
        res.status(200).json({ message: 'Barbeiro atualizado com sucesso', barber });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar o barbeiro' });
    }
};

// Delete a barber
const deleteBarber = async (req, res) => {
    const { id } = req.params;

    try {
        // Procurar e excluir o barbeiro pelo ID
        const deletedBarber = await Barber.findByIdAndDelete(id);

        if (!deletedBarber) {
            return res.status(404).json({ error: 'Barbeiro não encontrado' });
        }

        res.status(200).json({ message: 'Barbeiro excluído com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao excluir o barbeiro' });
    }
};

// Get all barber
const getAllBarbers = async (req, res) => {
    try {
        const { barbershopId } = req.params;
        const barbers = await Barber.find({ barbershop: barbershopId }).populate('barbershop', 'name'); // Popula a barbearia associada
        res.status(200).json(barbers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao obter os barbeiros' });
    }
};

// Get a specific barber
const getBarberById = async (req, res) => {
    const { id } = req.params;

    try {
        const barber = await Barber.findById(id).populate('barbershop', 'name');
        if (!barber) {
            return res.status(404).json({ error: 'Barbeiro não encontrado' });
        }

        res.status(200).json(barber);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao obter o barbeiro' });
    }
};

module.exports = {
    createBarber,
    updateBarber,
    deleteBarber,
    getAllBarbers,
    getBarberById
};