require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const mongoose = require('mongoose');
const port = process.env.PORT || 8000;
const { verifyAdminUser } = require('./services/verifyAdminUser');
const { generateMonthlyReport } = require('./services/generateMonthlyReport');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());

// Import Routes
const routeUsers = require('./routes/users');
const routeAppointments = require('./routes/appointments');
const routeServices = require('./routes/services');
const routeTransactions = require('./routes/transactions');
const routeProducts = require('./routes/product');
const routeReport = require('./routes/report');
const routeBarbershop = require('./routes/barbershop');
const routeBarber = require('./routes/barber');
const routeSlot = require('./routes/slot');
const routePayment = require('./routes/payment');

// Routes
app.use(routeUsers);
app.use(routeAppointments);
app.use(routeServices);
app.use(routeTransactions);
app.use(routeProducts);
app.use(routeReport);
app.use(routeBarbershop);
app.use(routeBarber);
app.use(routeSlot);
app.use(routePayment);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        app.emit('ready');
        console.log('Connected to MongoDB');
    })
    .catch((error) => console.log(error));

// Server
app.on('ready', () => {
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
        console.log(`http://localhost:${8000}`);

        verifyAdminUser();

        // Start cron jobs
        cron.schedule('59 23 28-31 * *', generateMonthlyReport);
    });
});