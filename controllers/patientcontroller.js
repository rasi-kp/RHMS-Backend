const { Op } = require('sequelize');

const Sequelize = require('sequelize');
const Doctor = require('../model/doctor')
const Patient = require("../model/patients")
const User = require('../model/user')
const Prescription = require('../model/prescription')
const AvailableToken = require('../model/AvailableToken')
const Appointment = require('../model/appointment');
const { token } = require('morgan');

const { sendSMS } = require('../util/message');

module.exports = {

  dashboard: async (req, res) => {
    try {
      const userid = req.user.userId
      const subscription = await User.findOne({attributes:['subscription'], where :{ user_id : userid,}})
      const totalMembers = await Patient.count({where:{user_id:userid,status:"Active"}});
      const upcomingAppointments = await Appointment.findAll({
        attributes: ['appointment_id', 'date', 'time', 'status'],
        where: {user_id: userid, status: ['scheduled']},
        order: [['date', 'DESC']],
        include: [
          {
            model: Patient,
            as: 'patient',
            attributes: ['first_name', 'last_name','gender'],
          },
          {
            model: Doctor,
            as: 'doctor',
            attributes: ['first_name', 'last_name']
          }
        ]
      })
      const appointmentcount = await Appointment.count({where:{user_id:userid,status:['scheduled','completed']}});
      return res.status(200).json({upcomingAppointments,subscription,totalMembers,appointmentcount});
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
  profile :async(req,res)=>{
    const userid = req.user.userId
    const data=await User.findOne({where:{user_id:userid}})
    return res.status(200).json({data})
  },
  profileadd :async(req,res)=>{
    const userId = req.user.userId;
        const user = await User.findOne({ where: { user_id: userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (req.file) {
            user.image = req.file.filename;
        }
        if (req.body.first_name) {
            user.first_name = req.body.first_name;
        }
        if (req.body.last_name) {
            user.last_name = req.body.last_name;
        }
        if (req.body.dob) {
            user.date_of_birth = req.body.dob;
        }
        if (req.body.gender) {
            user.gender = req.body.gender;
        }
        if (req.body.blood_group) {
            user.blood_group = req.body.blood_group;
        }
        await user.save();
        return res.status(200).json({success:"success", user });
  },
  prescription: async (req, res) => {
    const appointmentid = req.params.id;
    try {
      const prescription = await Prescription.findOne({
        where: { appointment_id: appointmentid },
        include: [
          {
            model: Patient,
            as: 'patient',
            attributes: ['patient_id', 'first_name', 'gender', 'last_name', 'age'],
          },
          {
            model: Doctor,
            as: 'doctordetails',
            attributes: ['doctor_id', 'image', 'first_name', 'last_name', 'specialization', 'qualification'],
          }
        ]
      });

      if (!prescription) {
        return res.status(404).json({ error: 'Prescription not found' });
      }
      return res.status(200).json({ prescription });

    } catch (error) {
      console.error('Error fetching prescription:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  allp: async (req, res) => {
    const userid = req.user.userId
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search;
    const whereCondition = {
      user_id: userid,
      status: 'Active'
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
    const specialization = req.query.specialization;
    const whereCondition = {};
    if (specialization) {
      whereCondition.specialization = specialization;
    }
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
    await Patient.update({ status: 'deleted' }, { where: { user_id: userid, patient_id: pid } });
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
      const [day, month, year] = dob.split('/');
      const dob1 = `${year}-${month}-${day}`;
      const userData = {
        user_id: userid,
        first_name: fname,
        last_name: lname || null,
        date_of_birth: dob1,
        blood_group: bg,
        age: age,
        weight: weight || null,
        height: height || null,
        gender: gender,
        status: 'Active',
      };

      const newUser = await Patient.create(userData);
      return res.status(200).json({ message: "success", userid: newUser.user_id });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
  viewmonitor: async (req, res) => {
    const doctorid = req.query.doctorid
    const date = req.query.date;
    var formattedDate = date
    const doctor = await Doctor.findOne({
      attributes: ['image', 'doctor_id', 'first_name', 'last_name', 'gender', 'qualification', 'specialization', 'email'],
      where: { doctor_id: doctorid }
    })
    const Tokens = await AvailableToken.findAll({
      attributes: ['token_no', 'status', 'time'],
      where: {
        doctor_id: doctorid,
        date: formattedDate,
      },
      order: [['token_no', 'ASC']],
    });
    res.status(200).json({ tokens: Tokens, doctor });
  },
  alltoken: async (req, res) => {
    const userid = req.user.userId
    const doctorid = req.query.doctorid
    const date = req.query.date;
    const [day, month, year] = date.split('-');
    const formattedDate = `${year}-${month}-${day}`;
    const Tokens = await AvailableToken.findAll({
      attributes: ['token_no', 'status'],
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
    const { selectedTokens, selectedDate, doctorid, patientid, appointmentid } = req.body;
    const { name, time } = selectedTokens;
    const [day, month, year] = selectedDate.date.split('-');
    const formattedDate = `${year}-${month}-${day}`;
    if (appointmentid) {
      const appointment = await Appointment.findOne({ where: { appointment_id: appointmentid } });
      await Appointment.update({ status: 'resheduled' }, { where: { appointment_id: appointmentid } })
      await AvailableToken.update({ is_available: true, status: 'available' },
        { where: { token_id: appointment.token_id } });
    }
    const token_id = await AvailableToken.findOne({ where: { doctor_id: doctorid, token_no: parseInt(name), date: formattedDate, is_available: true } })
    if (!token_id) {
      return res.status(400).json({ error: "No Token Available" })
    }
    await Appointment.create({
      user_id: userid,
      patient_id: patientid,
      doctor_id: doctorid,
      token_id: token_id.token_id,
      date: formattedDate,
      time: time,
      status: 'scheduled'
    });
    await AvailableToken.update({ is_available: false, status: 'booked' },
      { where: { token_id: token_id.token_id } });

    sendSMS(userid, doctorid, patientid, selectedTokens, selectedDate);
    return res.status(200).json({ message: "success" });
  },
  appointments: async (req, res) => {
    const userid = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search;
    const date = req.query.date;

    const whereCondition = {
      user_id: userid,
      status: ['scheduled', 'cancelled']
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
      order: [['date', 'DESC']],
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['patient_id', 'first_name', 'gender', 'last_name', 'age'],
        },
        {
          model: AvailableToken,
          as: 'token',
          attributes: ['token_no', 'is_available', 'status'],
        },
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['doctor_id', 'first_name', 'last_name']
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
    const date = req.query.date;

    const whereCondition = {
      user_id: userid,
      status: ['completed']
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
      where:whereCondition,
      order: [['date', 'DESC']],
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
  dappointment: async (req, res) => {
    const id = req.params.id
    const appointment = await Appointment.findByPk(id);
    appointment.status = 'cancelled';
    await appointment.save();
    const token_id = await AvailableToken.findOne({ where: { token_id: appointment.token_id } });
    token_id.is_available = true;
    await token_id.save()
    res.status(200).json({ message: 'Appointment canceled successfully' });
  },
  rappointment: async (req, res) => {
    const userid = req.user.userId
    const { appointmentid, selectedTokens, selectedDate, doctorid, patientid } = req.body;
    const { name, time } = selectedTokens;
    const [day, month, year] = selectedDate.date.split('-');
    const formattedDate = `${year}-${month}-${day}`;

    const appointment = await Appointment.findByPk(appointmentid);
    appointment.status = 'rescheduled';
    await appointment.save();
    const oldtoken = await AvailableToken.findOne({ where: { token_id: appointment.token_id } });
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

