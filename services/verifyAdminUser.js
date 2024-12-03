const User = require('../models/UserSchema');
const bcrypt = require('bcryptjs');

const verifyAdminUser = async () => {
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
            return;
        }
    } catch (error) {
        console.error(error);
    }
};

module.exports = { verifyAdminUser };