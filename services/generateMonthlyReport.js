const MonthlyReport = require('../models/MonthlyReport');
const { getFinancialReport } = require('../controllers/ReportController');

const generateMonthlyReport = async () => {
    try {
        const currentDate = new Date();
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        startDate.setUTCHours(0, 0, 0, 0);
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        endDate.setUTCHours(23, 59, 59, 999);

        const startDateISO = startDate.toISOString();
        const endDateISO = endDate.toISOString();

        const req = {
            query: {
                startDate: startDateISO,
                endDate: endDateISO
            },
            params: { barbershopId: '673ff4737373b6c79cf58106' }
        };
        const res = {
            json: (data) => {
                return data;
            }
        };

        const result = await getFinancialReport(req, res);

        const existingMonthlyReport = await MonthlyReport.find({
            barbershop: req.params.barbershopId,
            startDate: { $gte: startDateISO }
        });
        if (existingMonthlyReport.length > 0) {
            console.log('Relatório já existe');
            return;
        }

        const monthlyReport = new MonthlyReport({
            startDate: startDateISO,
            endDate: endDateISO,
            barbershop: req.params.barbershopId,
            totalBalance: result.Saldo_total,
            totalRevenue: result.Total_receitas,
            totalExpense: result.Total_despesas,
            totalServices: result.Total_servicos,
            totalProducts: result.Total_produtos,
            totalServicesCompleted: result.Total_servicos_concluidos,
            totalProductsSold: result.Total_produtos_vendidos,
            totalBarbers: result.Total_barbeiros.map(barber => ({
                barber: barber.Barbeiro,
                revenue: barber.Receita,
                expense: barber.Despesa,
                balance: barber.Saldo,
                totalServices: barber.Valor_servicos,
                totalProducts: barber.Valor_produtos,
                services: barber.servicos,
                products: barber.produtos
            })),
        });

        await monthlyReport.save();
        console.log('Relatório mensal gerado e salvo com sucesso!');
    } catch (error) {
        console.error(`Erro ao gerar o relatório mensal: ${error}`);
    }
}

module.exports = { generateMonthlyReport };