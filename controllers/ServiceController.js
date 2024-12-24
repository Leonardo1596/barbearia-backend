const Service = require('../models/Service');
const Barbershop = require('../models/BarbershopSchema');

const createService = async (req, res) => {
    try {
        const { name, description, duration, price, barbershop } = req.body;
        const existingBarbershop = await Barbershop.findById(barbershop).populate('services');

        if (!existingBarbershop) {
            return res.status(404).json({ message: 'Barbearia não encontrada' });
        }

        const newService = new Service({ name, description, duration, price, barbershop });
        await newService.save();

        existingBarbershop.services.push(newService._id);
        await existingBarbershop.save();

        res.status(201).json(newService);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Erro ao criar o serviço' });
    }
};

const deleteService = async (req, res) => {
    const { id } = req.params;

    try {
        // Search and delete the service by ID
        const deletedService = await Service.findByIdAndDelete(id);

        if (!deletedService) {
            return res.status(404).json({ error: 'Serviço não encontrado' });
        }

        await Barbershop.findByIdAndUpdate(deletedService.barbershop, {
            $pull: { services: id }
        });

        res.status(200).json({ message: 'Serviço excluído com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao excluir o serviço' });
    }
};

const updateService = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        // Update service and returns the updated document
        const updatedService = await Service.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!updatedService) {
            return res.status(404).json({ error: 'Serviço não encontrado' });
        }

        res.status(200).json(updatedService);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar o serviço' });
    }
};

const getServices = async (req, res) => {
    try {
        const { barbershopId } = req.params;

        const services = await Service.find({ barbershop: barbershopId });
        res.status(200).json(services);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao obter os serviços' });
    }
};

module.exports = {
    createService,
    deleteService,
    updateService,
    getServices
};