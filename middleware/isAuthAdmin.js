const jwt = require('jsonwebtoken');

const verifyAdminToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(400).json({ error: 'Unauthorized: Token not provided' });
    }
    const token = authHeader.split(' ')[1];
    
    try {
        const admin = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
        req.admin = admin;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = verifyAdminToken;
