const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize');


const Admin = require('../model/admin')
const Doctor = require('../model/doctor')
const Patient =require('../model/patients')
const AvailableToken = require('../model/AvailableToken')
const Appointment = require('../model/appointment')



module.exports = {

  accept: async (req, res) =>{
    const doctorid = req.doctor.doctorId
    const appointmentid=req.params.id
    const detials = await Appointment.findOne({
      attributes: ['appointment_id'],
      where: {appointment_id:appointmentid},
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['patient_id', 'first_name', 'gender', 'last_name', 'age','blood_group','weight','height'],
        },
        {
          model: AvailableToken,
          as: 'token',
          attributes: ['token_no'],
        },
      ]
    })
  },
  absent: async (req, res) =>{
    const doctorid = req.doctor.doctorId
    const appointmentid=req.params.id
    const appointment = await Appointment.findOne({ where: { appointment_id: appointmentid } });
    await Appointment.update({ status: 'pending' }, { where: { appointment_id: appointmentid } })
    await AvailableToken.update({status: 'absent' },
      { where: { token_id: appointment.token_id } });
  },
  notify: async (req, res) =>{
    const doctorid = req.doctor.doctorId
    const appoitmentid=req.params.id
  },

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
      const { tokens, date } = req.body;
      const { day, date: appointmentDate } = date;

      for (let i = 0; i < tokens.length; i++) {
        const tokenInfo = tokens[i];

        const { name , time } = tokenInfo;
        if(!name){
          continue
        }
        const tokenNumber = name
        const [day, month, year] = appointmentDate.split('-');
        const formattedDate = `${year}-${month}-${day}`;

        const existingToken = await AvailableToken.findOne({
          where: {
            token_no: tokenNumber,
            doctor_id: doctorid,
            date: formattedDate,
          },
        });
        if (existingToken) {
          // res.status(201).json({message:`Token already exists for doctor ${doctorid} on ${formattedDate} with token number ${tokenNumber}`})
          continue;
        }
        await AvailableToken.create({
          doctor_id: doctorid, // Assuming doctor_id is available in req.user
          token_no: tokenNumber, // Assuming tokens are indexed from 1
          date: formattedDate,
          time,
          is_available: true,
          status: 'available', // Set the initial status
        });
      }
      res.status(201).json({ message: 'Tokens added successfully' });
    } catch (error) {
      console.error('Error adding tokens:', error);
      res.status(500).json({ error: 'Failed to add tokens' });
    }
  },
  addedtokens: async (req, res) => {
    const doctorid = req.doctor.doctorId
    const date = req.params.date
    const [day, month, year] = date.split('-');
    const formattedDate = `${year}-${month}-${day}`;
    const Tokens = await AvailableToken.findAll({
      attributes: ['token_no'],
      where: {
        doctor_id: doctorid,
        date: formattedDate,
      },
    });
    res.status(200).json({ tokens:Tokens });
  },
  appointments: async (req, res) => {
    const doctorid = req.doctor.doctorId;
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search;
    const date = req.query.date;

    const whereCondition = {
      doctor_id: doctorid,
      status: ['scheduled']
    };
    if (date) {
      whereCondition.date = date;
    }
    if (search) {
      whereCondition[Sequelize.Op.and] = [
        whereCondition[Sequelize.Op.and] || {},
        Sequelize.literal(`"patient"."first_name" ILIKE '%${search}%' OR "patient"."last_name" ILIKE '%${search}%'`)
      ];
    }

    const bookedAppointments = await Appointment.findAll({
      attributes: ['appointment_id', 'date', 'time', 'status'],
      where: whereCondition,
      order: [
        ['date', 'DESC'], // Order by date in descending order
        ['token', 'token_no', 'ASC'] // Then order by token_no in the AvailableToken model in ascending order
    ],
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['patient_id', 'first_name', 'gender', 'last_name', 'age'],
        },
        {
          model: AvailableToken,
          as: 'token',
          attributes: ['token_no'],
        },
      ]
    })
    const totalPages = Math.ceil(bookedAppointments.length / 5);
    const startIndex = (page - 1) * 5;
    const endIndex = page * 5;

    const paginatedappointment = bookedAppointments.slice(startIndex, endIndex);
    return res.status(200).json({
      page: page,
      limit: 5,
      totalPages: totalPages,
      appointment: paginatedappointment
    });
  },
  cappointment: async (req, res) => {
    const userid = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search;

    const bookedAppointments = await Appointment.findAll({
      attributes: ['appointment_id', 'date', 'time', 'status'],
      where: {
        user_id: userid,
        status: "completed"
      },
      order: [['date', 'ASC']],
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['first_name', 'gender', 'last_name', 'age'],
        },
        {
          model: AvailableToken,
          as: 'token',
          attributes: ['token_no', 'is_available', 'status'],
        },
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['first_name', 'last_name']
        }
      ]
    })
    const totalPages = Math.ceil(bookedAppointments.length / 5);
    const startIndex = (page - 1) * 5;
    const endIndex = page * 5;

    const paginatedappointment = bookedAppointments.slice(startIndex, endIndex);
    return res.status(200).json({
      page: page,
      limit: 5,
      totalPages: totalPages,
      appointment: paginatedappointment
    });
  },
}

