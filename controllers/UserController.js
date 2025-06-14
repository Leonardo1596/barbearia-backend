const User = require('../models/UserSchema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Barbershop = require('../models/BarbershopSchema');
const Barber = require('../models/BarberSchema');

const register = async (req, res, next) => {
    try {
        // Verify if there is a admin user
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (!existingAdmin) {
            const hashedPass = await bcrypt.hash('adminpassword', 10);
            const adminUser = new User({
                name: 'Admin',
                email: 'admin@example.com',
                password: hashedPass,
                role: 'admin'
            });
            await adminUser.save();
            console.log('Usuário admin criado');
        }

        // Hash of password
        const hashedPass = await bcrypt.hash(req.body.password, 10);

        // Check If the email already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            console.log('Email already exists');
            return res.json({ message: 'Email already exists' });
        }

        // Verify if admin is trying to create a manager
        if (req.body.role === 'gerente') {
            // Check if barbershop exists
            const barbershopId = req.body.barbershop;
            const existingBarbershop = await Barbershop.findById(barbershopId);
            if (!existingBarbershop) {
                return res.status(404).json({ message: 'Barbearia não encontrada' });
            }
        }

        // Creation of new user
        let user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPass,
            barbershop: req.body.role === 'barbeiro' || req.body.role === 'gerente' ? req.body.barbershop : undefined,
            role: req.body.role || 'barbeiro'
        });

        // Save user
        const savedUser = await user.save();

        // Create token
        const accessToken = jwt.sign({ _id: savedUser._id, email: savedUser.email }, process.env.JWT_KEY, {
            expiresIn: '86400s'
        });

        console.log('Successfully registered');
        console.log(`User: ${savedUser.username}`);
        console.log(savedUser);

        res.status(201).json({ token: accessToken, userProfile: savedUser, message: 'Successfully registered' });
    } catch (error) {
        console.log(error);
        res.json({ message: 'An error occurred' });
    }
};

const login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(async user => {
            if (user) {
                bcrypt.compare(req.body.password, user.password, async (err, result) => {
                    if (err) {
                        res.json({ error: err });
                    }
                    if (result) {
                        // Create token
                        const accessToken = jwt.sign({ _id: user._id, email: user.email, username: user.username }, process.env.JWT_KEY, {
                            expiresIn: '86400s'
                        });

                        const barber = await Barber.find();

                        let userInfo = {
                            _id: user._id,
                            name: user.name,
                            barbershop: user.barbershop,
                            barber: barber,
                            role: user.role,
                            email: user.email,
                        };

                        if (user.role === 'gerente') {
                            const populatedUser = await user.populate('barbershop');
                            userInfo.barbershopName = populatedUser.barbershop.name;
                        }

                        // Successfully
                        console.log(`User: ${user.email} is signed`)

                        res.json({ token: accessToken, userInfo: userInfo, message: 'Logado com sucesso' });
                        next();
                    } else {
                        res.json({ message: 'A senha está incorreta' });
                    }
                });
            } else {
                console.log('user not found');
                res.json({ message: 'Usuário não encontrado' });
            }
        });
};

const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const {
            email,
            username,
        } = req.body;

        // Get existing user
        const existingUser = await User.findOne({ _id: userId });

        if (!existingUser) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        };

        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            { email: email, username: username },
            { new: true }
        );

        res.json(updatedUser);

    } catch (error) {
        console.error('Ocorreu um erro ao atualizar o usuário: ', error);
        res.status(500).json({ error: 'Ocorreu um erro ao atualizar o usuário' });
    }
};

const getUser = async (req, res) => {

    User.findOne({ _id: req.params.userId })
        .then(async user => {
            let userInfo = {
                _id: user._id,
                name: user.name,
                email: user.email,
            }

            res.json(userInfo);
        })
};


module.exports = {
    register, login, updateUser, getUser
}