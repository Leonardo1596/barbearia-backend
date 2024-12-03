const Barbershop = require('../models/BarbershopSchema');
const User = require('../models/UserSchema');

// Controlador para criar uma barbearia
const createBarbershop = async (req, res) => {
    try {
        const { name, address, contact, monthlyFee, subscriptionStatus, status } = req.body;

        // Verificar se os campos obrigatórios estão presentes
        if (!name || !address || !contact) {
            return res.status(400).json({ message: 'Todos os campos obrigatórios precisam ser preenchidos.' });
        }

        // Check if there is a barbershop with the same name
        const existingBarbershop = await Barbershop.findOne({ name });
        if (existingBarbershop) {
            return res.status(400).json({ message: 'Já existe uma barbearia com esse nome.' });
        }

        // Create a new barbershop
        const newBarbershop = new Barbershop({
            name,
            address,
            contact,
            monthlyFee,
            subscriptionStatus,
            status
        });

        // Save barbershop
        const savedBarbershop = await newBarbershop.save();

        res.status(201).json({
            message: 'Barbearia criada com sucesso!',
            barbershop: savedBarbershop
        });
    } catch (error) {
        console.error('Erro ao criar barbearia:', error);
        res.status(500).json({ message: 'Ocorreu um erro ao criar a barbearia.' });
    }
};

// Controlador para associar um barbeiro à barbearia
const assignBarberToBarbershop = async (req, res) => {
    try {
        const { userId, barbershopId } = req.body;

        // Verificar se a barbearia e o barbeiro existem
        const barbershop = await Barbershop.findById(barbershopId);
        if (!barbershop) {
            return res.status(404).json({ message: 'Barbearia não encontrada.' });
        }

        const barber = await User.findById(userId);
        if (!barber || barber.role !== 'barbeiro') {
            return res.status(404).json({ message: 'Usuário não encontrado ou não é um barbeiro.' });
        }

        // Associar o barbeiro à barbearia
        barber.barbershop = barbershopId;
        await barber.save();

        res.status(200).json({ message: 'Barbeiro associado à barbearia com sucesso.' });
    } catch (error) {
        console.error('Erro ao associar barbeiro à barbearia:', error);
        res.status(500).json({ message: 'Ocorreu um erro ao associar o barbeiro.' });
    }
};

module.exports = {
    createBarbershop,
    assignBarberToBarbershop
};