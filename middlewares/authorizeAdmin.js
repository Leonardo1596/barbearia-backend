const jwt = require('jsonwebtoken');
const User = require('../models/UserSchema');

const authorizeAdmin = async (req, res, next) => {
    try {
        // Obter o token da requisição
        const token = req.header('Authorization').replace('Bearer ', '');
        
        // Verificar o token
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        
        // Buscar o usuário no banco de dados
        const user = await User.findById(decoded._id);
        
        // Verificar se o usuário tem a role 'admin'
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Acesso proibido. Somente admins podem executar essa função.' });
        }

        // Adicionar o usuário à requisição
        req.user = user;
        
        // Seguir para o próximo middleware
        next();
    } catch (error) {
        res.status(401).json({ message: 'Não autorizado. Token inválido ou expirado.' });
    }
};

module.exports = authorizeAdmin;