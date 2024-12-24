const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const MonthlyReport = require('../models/MonthlyReport');
const Barbershop = require('../models/BarbershopSchema');

const getFinancialReport = async (req, res) => {
    try {
        const { barbershopId } = req.params;
        const { startDate, endDate } = req.query;

        const fromDate = new Date(startDate);
        fromDate.setUTCHours(0, 0, 0, 0);
        const toDate = new Date(endDate);
        toDate.setUTCHours(23, 59, 59, 999);

        const existingBarbershop = await Barbershop.findById(barbershopId);
        if (!existingBarbershop) {
            return res.status(404).json({ message: 'Barbearia não encontrada' });
        }

        const retrievedTransactions = await Transaction.find({
            barbershop: barbershopId,
            date: {
                $gte: fromDate,
                $lt: toDate
            },
            paymentStatus: 'Pago',

        })
            .populate({
                path: 'appointment',
                populate: {
                    path: 'service',
                    select: 'price'
                }
            })
            .populate({
                path: 'barber'
            });

        // Lógica de ganho semanal
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Início da semana (domingo)
        startOfWeek.setUTCHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Fim da semana (sábado)
        endOfWeek.setUTCHours(23, 59, 59, 999);

        const weeklyTransactions = retrievedTransactions.filter(transaction =>
            transaction.date >= startOfWeek && transaction.date <= endOfWeek
        );

        const weeklyEarnings = weeklyTransactions.reduce((total, transaction) => {
            if (transaction.type === 'servico' || transaction.type === 'produto') {
                return total + (transaction.amount || 0);
            }
            return total;
        }, 0);

        // Lógica existente para calcular os valores
        const filteredServiceTransactions = retrievedTransactions.filter(transaction => transaction.type === 'servico');
        const filteredProductTransactions = retrievedTransactions.filter(transaction => transaction.type === 'produto');

        if (!retrievedTransactions) {
            res.status(404).json({ error: "Não há nenhuma transação nesse período" });
        }

        const serviceTotalAmount = filteredServiceTransactions.reduce((acc, transaction) => {
            const serviceTotal = transaction.appointment.service.reduce((sum, service) => sum + (service.price || 0), 0);
            return acc + serviceTotal;
        }, 0);

        const productTotalAmount = filteredProductTransactions.reduce((sum, product) => {
            return sum + (product.amount || 0);
        }, 0);

        const serviceTotalQuantity = filteredServiceTransactions.reduce((sum, transaction) => {
            return sum + (transaction.appointment.service.length || 0);
        }, 0);

        const productTotalQuantity = filteredProductTransactions.reduce((sum, product) => {
            return sum + (product.quantity || 0);
        }, 0);

        const totalRevenue = retrievedTransactions
            .filter(transaction => transaction.type === 'servico' || transaction.type === 'produto')
            .reduce((total, transaction) => {
                return total + transaction.amount;
            }, 0);

        const totalExpense = retrievedTransactions
            .filter(transaction => transaction.type === 'despesa')
            .reduce((total, transaction) => {
                return total + transaction.amount;
            }, 0);

        const totalBalance = totalRevenue - totalExpense;

        const barberTransactions = retrievedTransactions
            .filter(transaction =>
                transaction.type === 'servico' || transaction.type === 'produto')
            .reduce((acc, transaction) => {
                const barberId = transaction.barber.toString();
                if (!acc[barberId]) {
                    acc[barberId] = {
                        barberName: transaction.barber.name,
                        revenue: 0,
                        expense: 0,
                        balance: 0,
                        services: 0,
                        products: 0,
                        services_amount: 0,
                        products_amount: 0
                    };
                }

                if (transaction.type === 'servico' || transaction.type === 'produto') {
                    acc[barberId].revenue += transaction.amount;
                    if (transaction.type === 'servico') {
                        transaction.appointment.service.map((tran) => acc[barberId].services_amount += tran.price)
                        acc[barberId].services += transaction.appointment.service.length;
                    }
                    if (transaction.type === 'produto') {
                        acc[barberId].products += transaction.quantity;
                        acc[barberId].products_amount += transaction.amount;
                    }
                } else if (transaction.type === 'despesa') {
                    acc[barberId].expense += transaction.amount;
                }

                acc[barberId].balance = acc[barberId].revenue - acc[barberId].expense;

                return acc;
            }, {});

        const barberBalances = Object.entries(barberTransactions).map(([barberId, data]) => ({
            Barbeiro: data.barberName,
            Receita: data.revenue,
            Despesa: data.expense,
            Saldo: data.balance,
            servicos: data.services,
            produtos: data.products,
            Valor_servicos: data.services_amount,
            Valor_produtos: data.products_amount
        }));

        const result = {
            startDate,
            endDate,
            Saldo_total: totalBalance,
            Total_receitas: totalRevenue,
            Total_despesas: totalExpense,
            Total_servicos: serviceTotalAmount,
            Total_produtos: productTotalAmount,
            Total_servicos_concluidos: serviceTotalQuantity,
            Total_produtos_vendidos: productTotalQuantity,
            Total_barbeiros: barberBalances,
            Ganho_semanal: weeklyEarnings // Adicionado o ganho semanal
        };
        // console.log(result);
        res.json(result);
    } catch (error) {
        console.error(error);
    }
};


const getDailyData = async (req, res) => {
    const { barbershopId } = req.params;
    const { startDate, endDate } = req.query;

    const fromDate = new Date(startDate);
    fromDate.setUTCHours(0, 0, 0, 0);
    const toDate = new Date(endDate);
    toDate.setUTCHours(23, 59, 59, 999);

    const existingBarbershop = await Barbershop.findById(barbershopId);
    if (!existingBarbershop) {
        return res.status(404).json({ message: 'Barbearia não encontrada' });
    }

    const retrievedTransactions = await Transaction.find({
        barbershop: barbershopId,
        date: {
            $gte: fromDate,
            $lt: toDate
        },
        paymentStatus: 'Pago',
    })
        .populate({
            path: 'appointment',
            populate: {
                path: 'service',
                select: 'price'
            }
        })
        .populate({
            path: 'barber'
        });


    const aggregatedData = {};

    retrievedTransactions.forEach(transaction => {
        if (transaction.type !== 'despesa') {
            const transactionDate = new Date(transaction.date).toISOString().split('T')[0]; // Formato YYYY-MM-DD

            // Se a data ainda não existe no objeto, cria uma nova entrada
            if (!aggregatedData[transactionDate]) {
                aggregatedData[transactionDate] = {
                    date: transactionDate,
                    totalAmount: 0, // Total de valores do dia
                    totalTransactions: 0, // Contagem de transações
                };
            }

            // Agrega o valor da transação
            aggregatedData[transactionDate].totalAmount += transaction.amount;
            aggregatedData[transactionDate].totalTransactions += 1;
        }
    });

    // Converte o objeto em um array

    res.json(aggregatedData);
};

module.exports = {
    getFinancialReport,
    getDailyData
};