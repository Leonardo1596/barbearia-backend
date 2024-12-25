const Transaction = require('../models/Transaction');
const User = require('../models/UserSchema');
const Product = require('../models/ProdutctSchema');
const MonthlyReport = require('../models/MonthlyReport');

const createTransaction = async (req, res) => {
    try {
        const { type, description, product, barber, barbershop, quantity, date, amount } = req.body;
        
        if (!type || !['produto', 'despesa'].includes(type)) {
            return res.status(400).json({ error: 'Tipo de transação inválida' });
        }

        if (type === 'despesa') {
            if (!amount || amount <= 0) {
                return res.status(400).json({ error: 'Valor deve ser maior do que zero' });
            }

            const newTransaction = new Transaction({
                type,
                barbershop,
                amount,
                description,
                date
            });
            await newTransaction.save();

            res.status(201).json({ message: 'Transactions added successfully', newTransaction });
            return;
        }

        const existingProduct = await Product.findById(product);
        if (!existingProduct) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        if (existingProduct.stock < quantity) {
            return res.status(400).json({ error: 'Estoque insuficiente para essa quantidade' });
        }

        const newTransaction = new Transaction({
            type,
            product,
            barber,
            barbershop,
            date,
            quantity,
            amount: quantity * existingProduct.price,
            paymentStatus: ''
        });
        await newTransaction.save();

        existingProduct.stock -= quantity;
        await existingProduct.save();

        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;

        let monthlyReport = await MonthlyReport.findOne({ barbershop, year, month });

        if (!monthlyReport) {
            monthlyReport = new MonthlyReport({
                barbershop: barbershop,
                year,
                month,
                totalBarbershop: 0,
                totalService: 0,
                totalProduct: 0
            });
            await monthlyReport.save();
        }

        // Atualiza o relatório existente diretamente no modelo MonthlyReport
        await MonthlyReport.findOneAndUpdate(
            { barbershop: barbershop, year, month },
            {
                $inc: {
                    totalBarbershop: quantity * existingProduct.price,
                    totalProductAmount: type === 'produto' ? quantity * existingProduct.price : 0,
                    totalProductQuantity: type === 'produto' ? quantity : 0,
                }
            },
            { new: true }
        );

        res.status(201).json(newTransaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error ao criar transação' });
    }
};

const deleteTransaction = async (req, res) => {
    const { id } = req.params;

    try {
        // Search and delete the transaction by ID
        const deletedTransaction = await Transaction.findByIdAndDelete(id);

        if (!deletedTransaction) {
            return res.status(404).json({ error: 'Transação não encontrada' });
        }

        res.status(200).json({ message: 'Transação excluída com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao excluir transação' });
    }
};

const updateTransaction = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const updatedTransaction = await Transaction.findOneAndUpdate(
            { appointmentId: id }, // Filtro pelo ID do agendamento
            { status }, // Atualiza o status
            { new: true } // Retorna o documento atualizado
        );

        if (!updatedTransaction) {
            return res.status(404).json({ message: 'Transação não encontrada.' });
        }

        res.status(200).json(updatedTransaction);
    } catch (error) {
        console.error('Erro ao atualizar transação:', error);
        res.status(500).json({ message: 'Erro ao atualizar transação.', error });
    }
}

module.exports = {
    createTransaction,
    deleteTransaction,
    updateTransaction
};