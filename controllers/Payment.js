const stripe = require('stripe')(process.env.STRIPE_KEY);
const Barbershop = require('../models/BarbershopSchema');

const processPayment = async (req, res) => {
    try {
        const { barbershopId } = req.params
        const { number, exp_month, exp_year, cvc, amount } = req.body;

        const existingBarbershop = await Barbershop.findById(barbershopId);
        console.log(number);

        // Card token creation
        const cardToken = await stripe.tokens.create({
            card: {
                number: req.body.number,
                exp_month: req.body.exp_month,
                exp_year: req.body.exp_year,
                cvc: req.body.cvc
            }
        });

        // Charge creation
        const charge = await stripe.charges.create({
            amount: req.body.amount * 100, // Valor a ser cobrado, em centavos
            currency: 'BRL', // Moeda (BRL para reais brasileiros)
            source: cardToken.id // ID do token do cartão criado anteriormente
        });

        // Successful processing
        res.status(200).json({ message: 'Successful payment made' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'There was an error processing the payment' });
    }
};

// Get charge by id
const getChargeId = async (req, res) => {
    try {
        const { email, amount } = req.query; // Optional

        // Listar as cobranças
        const charges = await stripe.charges.list({
            limit: 10, // Quantidade máxima de cobranças para retornar
        });

        // Filtrar cobranças pelo email ou valor (opcional)
        const filteredCharges = charges.data.filter(charge => {
            return (
                (email ? charge.billing_details.email === email : true) &&
                (amount ? charge.amount === amount * 100 : true)
            );
        });

        if (filteredCharges.length === 0) {
            return res.status(404).json({ message: 'Nenhuma cobrança encontrada.' });
        }

        res.status(200).json({ charges: filteredCharges });
    } catch (error) {
        console.error('Erro ao buscar chargeId:', error.message);
        res.status(500).json({ error: error.message });
    }
};

const refundPayment = async (req, res) => {
    try {
        const { chargeId, amount } = req.body;

        // Make refund
        const refund = await stripe.refunds.create({
            charge: chargeId, // Charge ID
            amount: amount ? amount * 100 : undefined, // Partial refund (optional)
        });

        res.status(200).json({ message: 'Pagamento estornado com sucesso', refund });
    } catch (error) {
        console.error('Erro ao processar estorno:', error.message);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    processPayment,
    getChargeId,
    refundPayment
}