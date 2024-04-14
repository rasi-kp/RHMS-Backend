const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize');


const Admin = require('../model/admin')
const Doctor = require('../model/doctor')
// require('../model/AvailableToken')
// require('../model/appointment')



module.exports = {

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const admin = await Admin.findOne({ where: { email: email } })
      if (admin) {
        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) {
          return res.status(401).json({ error: "Invalid password" });
        }
        const token = jwt.sign({ AdminID: admin.admin_id }, process.env.ADMIN_JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({ token,role:"admin", user: { id: admin.id, email: admin.email, name:"Admin" } });
      } 
      const doctor = await Doctor.findOne({
        where: { [Op.or]: [{ email: email }, { mob_no: email }] }
      });
      
      if (!doctor) {
        return res.status(404).json({ error: "Invalied Email ID or Mobile No" });
      }
      if (!doctor.isActive) {
        return res.status(403).json({ error: "Account is not active. Please contact the admin." });
      }
      const passwordMatch = await bcrypt.compare(password, doctor.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid password" });
      }
      const token = jwt.sign({ doctorId: doctor.doctor_id }, process.env.DOCTOR_JWT_SECRET, { expiresIn: '30d' });
      return res.status(200).json({ token,role:"doctor", user: { id: doctor.doctor_id, email: doctor.email, name: doctor.first_name, last:doctor.last_name} });
    } catch (error) {
      console.error('Error logging in:', error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
}

