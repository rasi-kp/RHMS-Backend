const { Op } = require('sequelize');

const Sequelize = require('sequelize');
const Doctor = require('../model/doctor')
const Patient = require("../model/patients")
const User = require('../model/user')
const AvailableToken = require('../model/AvailableToken')
const Appointment = require('../model/appointment');
const { token } = require('morgan');

module.exports = {

  dashboard: async (req, res) => {
    try {

    } catch (error) {
      console.error('Error logging in:', error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
  allp: async (req, res) => {
    const userid = req.user.userId
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search;
    const whereCondition = {
      user_id: userid
    };
    if (search) {
      whereCondition[Sequelize.Op.or] = {
        first_name: { [Sequelize.Op.iLike]: `%${search}%` },
      };
    }
    const patients = await Patient.findAll({ where: whereCondition, order: [['createdAt', 'DESC']] });
    const totalPages = Math.ceil(patients.length / 5);
    const startIndex = (page - 1) * 5;
    const endIndex = page * 5;

    const paginatedPatients = patients.slice(startIndex, endIndex);
    return res.status(200).json({
      page: page,
      limit: 5,
      totalPages: totalPages,
      data: paginatedPatients
    });
  },
  alldoctor: async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search;
    const whereCondition = {};
    if (search) {
      whereCondition[Sequelize.Op.or] = {
        first_name: { [Sequelize.Op.iLike]: `%${search}%` },
      };
    }
    const doctors = await Doctor.findAll({
      attributes: ['doctor_id', 'first_name', 'last_name', 'specialization', 'department', 'image', 'qualification', 'gender'],
      where: whereCondition, order: [['createdAt', 'DESC']]
    });
    const totalPages = Math.ceil(doctors.length / 5);
    const startIndex = (page - 1) * 5;
    const endIndex = page * 5;

    const paginatedDoctors = doctors.slice(startIndex, endIndex);
    return res.status(200).json({
      page: page,
      limit: 5,
      totalPages: totalPages,
      data: paginatedDoctors
    });
  },
  deletep: async (req, res) => {
    const userid = req.user.userId
    const pid = req.params.id;
    const patients = await Patient.destroy({ where: { user_id: userid, patient_id: pid } });
    return res.status(200).json({ success: "Successfully deleted" });
  },
  editp: async (req, res) => {
    const userid = req.user.userId
    const pid = req.params.id;
    const patients = await Patient.findOne({ where: { user_id: userid, patient_id: pid } });
    return res.status(200).json({ patient: patients });
  },
  editpost: async (req, res) => {
    const userid = req.user.userId
    try {
      const { patient_id, first_name, last_name, date_of_birth, blood_group, age, weight, height, gender } = req.body;
      const userData = {
        user_id: userid,
        first_name: first_name,
        last_name: last_name,
        date_of_birth: date_of_birth,
        blood_group: blood_group,
        age: age,
        weight: weight,
        height: height,
        gender: gender,
      };
      const newUser = await Patient.update(userData, {
        where: {
          patient_id: patient_id,
          user_id: userid
        },
      });
      return res.status(200).json({ message: "success", name: userData.first_name });
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
  addp: async (req, res) => {
    const userid = req.user.userId
    try {
      const { fname, lname, dob, bg, age, weight, height, gender } = req.body;
      const userData = {
        user_id: userid,
        first_name: fname,
        last_name: lname,
        date_of_birth: dob,
        blood_group: bg,
        age: age,
        weight: weight,
        height: height,
        gender: gender,
      };
      const newUser = await Patient.create(userData);
      return res.status(200).json({ message: "success", userid: newUser.user_id });
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
  alltoken: async (req, res) => {
    const userid = req.user.userId
    const doctorid = req.query.doctorid
    const date = req.query.date;

    const [day, month, year] = date.split('-');
    const formattedDate = `${year}-${month}-${day}`;
    const Tokens = await AvailableToken.findAll({
      attributes: ['token_no'],
      where: {
        doctor_id: doctorid,
        date: formattedDate,
        is_available: true
      },
    });
    res.status(200).json({ tokens: Tokens });
  },
  addappointment: async (req, res) => {
    const userid = req.user.userId
    const { selectedTokens, selectedDate, doctorid, patientid,appointmentid } = req.body;
    const { name, time } = selectedTokens;
    const [day, month, year] = selectedDate.date.split('-');
    const formattedDate = `${year}-${month}-${day}`;
    if(appointmentid){
    const appointment = await Appointment.findOne({ where: { appointment_id: appointmentid } });
      await Appointment.update({status:'resheduled'},{where:{appointment_id:appointmentid}})
      await AvailableToken.update({ is_available: true, status: 'available' },
      { where: { token_id: appointment.token_id } });
    }
    const token_id = await AvailableToken.findOne({ where: { doctor_id: doctorid, token_no: parseInt(name), date: formattedDate } })
    await Appointment.create({
      user_id: userid,
      patient_id: patientid,
      doctor_id: doctorid,
      token_id: token_id.token_id,
      date: formattedDate,
      time: time,
      status: 'scheduled'
    });
    await AvailableToken.update({ is_available: false, status: 'notavailable' },
      { where: { token_id: token_id.token_id } });
    return res.status(200).json({ message: "success" });
  },
  appointments: async (req, res) => {
    const userid = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search;

    const bookedAppointments = await Appointment.findAll({
      attributes: ['appointment_id', 'date', 'time', 'status'],
      where: {
        user_id: userid,
        status: ["scheduled","cancelled","resheduled"]
      },
      order: [['date', 'DESC']],
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['patient_id','first_name', 'last_name', 'age'],
        },
        {
          model: AvailableToken,
          as: 'token',
          attributes: ['token_no', 'is_available', 'status'],
        },
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['doctor_id','first_name', 'last_name']
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
          attributes: ['first_name', 'last_name', 'age'],
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
  dappointment: async (req, res) => {
    const id = req.params.id
    const appointment = await Appointment.findByPk(id);
    appointment.status = 'cancelled';
    await appointment.save();
    const token_id = await AvailableToken.findOne({ where: {token_id: appointment.token_id} });
    token_id.is_available = true;
    await token_id.save()
    res.status(200).json({ message: 'Appointment canceled successfully' });
  },
  rappointment: async (req, res) => {
    const userid = req.user.userId
    const {appointmentid, selectedTokens, selectedDate, doctorid, patientid } = req.body;
    const { name, time } = selectedTokens;
    const [day, month, year] = selectedDate.date.split('-');
    const formattedDate = `${year}-${month}-${day}`;

    const appointment = await Appointment.findByPk(appointmentid);
    appointment.status = 'rescheduled';
    await appointment.save();
    const oldtoken = await AvailableToken.findOne({ where: {token_id: appointment.token_id} });
    oldtoken.is_available = true;
    await oldtoken.save()

    const token_id = await AvailableToken.findOne({ where: { doctor_id: doctorid, token_no: parseInt(name), date: formattedDate } })

    await Appointment.create({
      user_id: userid,
      patient_id: patientid,
      doctor_id: doctorid,
      token_id: token_id.token_id,
      date: formattedDate,
      time: time,
      status: 'scheduled' // Set the initial status of the appointment
    });
    await AvailableToken.update({ is_available: false, status: 'notavailable' },
      { where: { token_id: token_id.token_id } });
    return res.status(200).json({ message: "success" });
  },
}

