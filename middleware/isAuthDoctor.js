const jwt = require('jsonwebtoken');

const verifyDoctorToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(400).json({ error: 'Unauthorized: Token not provided' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(400).json({ error: 'Unauthorized: Token not provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.DOCTOR_JWT_SECRET);
        req.doctor = decoded; 
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = verifyDoctorToken;
