const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize');


const Admin = require('../model/admin')
const Doctor = require('../model/doctor')
const AvailableToken = require('../model/AvailableToken')
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
        const token = jwt.sign({ AdminID: admin.admin_id }, process.env.ADMIN_JWT_SECRET, { expiresIn: '30d' });
        return res.status(200).json({ token, role: "admin", user: { id: admin.id, email: admin.email, name: "Admin" } });
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
      return res.status(200).json({ token, role: "doctor", user: { id: doctor.doctor_id, email: doctor.email, name: doctor.first_name, last: doctor.last_name } });
    } catch (error) {
      console.error('Error logging in:', error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
  addtoken: async (req, res) => {
    try {
      const doctorid = req.doctor.doctorId
      console.log(req.body, doctorid);
      const { tokens, date } = req.body;
      const { day, date: appointmentDate } = date;

      console.log(day, appointmentDate);

      // Iterate over the tokens array and create records in AvailableToken table
      for (let i = 0; i < tokens.length; i++) {
        const tokenInfo = tokens[i];

        // Extract token name and time
        const { name, time } = tokenInfo;
        console.log(name, time, i + 1);
        // Construct the datetime for the token
        // For simplicity, assuming appointmentDate is in 'DD-MM-YYYY' format
        const [day, month, year] = appointmentDate.split('-');
        const formattedDate = `${year}-${month}-${day}`;
        const datetime = new Date(`${formattedDate} ${time}`);

        // Create a record in the AvailableToken table
        await AvailableToken.create({
          doctor_id: doctorid, // Assuming doctor_id is available in req.user
          token_no: i + 1, // Assuming tokens are indexed from 1
          date: formattedDate,
          time,
          is_available: true,
          status: 'available', // Set the initial status
          created: new Date(), // Set the created timestamp
        });
      }

      res.status(201).json({ message: 'Tokens added successfully' });
    } catch (error) {
      console.error('Error adding tokens:', error);
      res.status(500).json({ error: 'Failed to add tokens' });
    }
  }
}

