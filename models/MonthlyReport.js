const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MonthlyReportSchema = new Schema({
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    barbershop: { type: Schema.Types.ObjectId, ref: 'Barbershop', required: true },
    totalBarbershop: { type: Number, default: 0 },
    totalBalance: { type: Number, required: true },
    totalRevenue: { type: Number, required: true },
    totalExpense: { type: Number, required: true },
    totalServices: { type: Number, required: true },
    totalProducts: { type: Number, required: true },
    totalServicesCompleted: { type: Number, required: true },
    totalProductsSold: { type: Number, required: true },
    totalBarbers: [{
        barber: { type: String, required: true },
        revenue: { type: Number, required: true },
        expense: { type: Number, required: true },
        balance: { type: Number, required: true },
        totalServices: { type: Number, required: true },
        totalProducts: { type: Number, required: true },
        services: { type: Number, required: true },
        products: { type: Number, required: true },
    }],
    totalServiceAmount: { type: Number, default: 0 },
    totalProductAmount: { type: Number, default: 0 },
    totalServiceQuantity: { type: Number, default: 0 },
    totalProductQuantity: { type: Number, default: 0 }
}, { collection: 'MonthlyReport' });

module.exports = mongoose.model('MonthlyReport', MonthlyReportSchema);