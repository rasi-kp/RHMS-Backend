const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const User = require('../model/user')
const Admin = require('../model/admin')
const Doctor = require('../model/doctor')
const Patient = require('../model/patients')
const AvailableToken = require('../model/AvailableToken')
const Appointment = require('../model/appointment')
const Prescription = require('../model/prescription');
const Chat = require('../model/chats');
const { sendPrescription } = require('../util/sendprescription');



module.exports = {
  getuserid:async(req,res)=>{
    const patientid=req.params.id
    const user=await Patient.findOne({attributes:['user_id'],where:{patient_id:patientid}})
    res.status(200).json({user})
  },
  allchat: async (req, res) => {
    const senderId = req.doctor.doctorId
    try {
      const chats = await Chat.findAll({
        attributes: ['senderId', 'receiverId', 'message', 'timestamp'],
        where: {
          senderId
        },
        include: [
          {
            model: User,
            as: 'ReceiverUser',
            attributes: ['name', 'last_name', 'image','user_id']
          }
        ],
        order: [['timestamp', 'DESC']], // Order by timestamp
      });
      const seenDoctors = new Map();
      const uniqueChats = chats.filter(chat => {
        const userId = chat.ReceiverUser?.user_id;
        if (seenDoctors.has(userId)) {
          return false; // Skip this entry as it's a duplicate
        } else {
          seenDoctors.set(userId, chat);
          return true;
        }
      });
      res.status(200).json({ uniqueChats });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  },
  messages:async(req,res)=>{
    const doctorid = req.doctor.doctorId
    let userId=req.params.id
    const user = await User.findOne({ where: { user_id: userId } ,attributes:['image','name','last_name']});
    const chats = await Chat.findAll({
      attributes:['senderId','receiverId','message'],
      where: {
          [Sequelize.Op.or]: [
              { senderId: doctorid, receiverId: userId },
              { senderId: userId, receiverId: doctorid }
          ]
      },
      order: [['createdAt', 'ASC']], // Optional: Order by creation date (ascending)
  });
    return res.status(200).json({chats,user})
  },
  allpatient: async (req, res) => {
    const doctorid = req.doctor.doctorId
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search;
    const whereCondition = {
      doctor_id: doctorid,
      status: 'completed',
    };
    if (search) {
      whereCondition[Sequelize.Op.and] = [
        whereCondition[Sequelize.Op.and] || {},
        Sequelize.literal(`"patient"."first_name" ILIKE '%${search}%' OR "patient"."last_name" ILIKE '%${search}%'`)
      ];
    }
    const patients = await Appointment.findAll({
      attributes: ['appointment_id'],
      where: whereCondition,
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['patient_id', 'first_name','blood_group','height','weight', 'last_name', 'age', 'gender'],
          required: true,
        },
      ],
      group: ['patient.patient_id', 'Appointment.appointment_id'],
    });
    const uniquePatientsSet = new Set();
    const uniquePatients = patients.reduce((acc, appointment) => {
      const { patient } = appointment;
      if (!uniquePatientsSet.has(patient.patient_id)) {
        uniquePatientsSet.add(patient.patient_id);
        acc.push(patient);
      }
      return acc;
    }, []);
    const totalPages = Math.ceil(uniquePatients.length / 5);
    const startIndex = (page - 1) * 5;
    const endIndex = page * 5;
    const paginatedPatients = uniquePatients.slice(startIndex, endIndex);
    return res.status(200).json({
      page: page,
      limit: 5,
      totalPages: totalPages,
      data: paginatedPatients
    });
  },
  accept: async (req, res) => {
    const doctorid = req.doctor.doctorId
    const appointmentid = req.params.id
    const detials = await Appointment.findOne({
      attributes: ['appointment_id', 'token_id'],
      where: { appointment_id: appointmentid },
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['patient_id', 'first_name', 'gender', 'last_name', 'age', 'blood_group', 'weight', 'height'],
        },
      ],
    })
    await AvailableToken.update({ status: 'checking' }, { where: { token_id: detials.token_id } });
    const prescription = await Prescription.findAll({
      attributes: ['prescription_id', 'observation', 'tablets', 'test', 'createdAt'],
      where: { patient_id: detials.patient.patient_id, doctor_id: doctorid },
      order: [['createdAt', 'DESC']],
    })
    res.status(200).json({ detials, prescription });
  },
  addprescription: async (req, res) => {
    try {
      const doctorid = req.doctor.doctorId
      const { appointmentid, patientid, observation, tablets, test } = req.body;

      const appointment = await Appointment.findOne({ where: { appointment_id: appointmentid } });
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      const newPrescription = await Prescription.create({
        patient_id: patientid,
        appointment_id: appointmentid,
        doctor_id: doctorid,
        observation,
        tablets,
        test,
      });
      await Appointment.update({ status: 'completed' }, { where: { appointment_id: appointmentid } })
      await AvailableToken.update({ status: 'completed' }, { where: { token_id: appointment.token_id } });
      sendPrescription(doctorid,req.body)
      res.status(201).json({
        message: 'Prescription added successfully',
        prescription: newPrescription,
      });
    } catch (error) {
      console.error('Error adding prescription:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  absent: async (req, res) => {
    const doctorid = req.doctor.doctorId
    const appointmentid = req.params.id
    const appointment = await Appointment.findOne({ where: { appointment_id: appointmentid } });
    await Appointment.update({ status: 'pending' }, { where: { appointment_id: appointmentid } })
    await AvailableToken.update({ status: 'absent' },
      { where: { token_id: appointment.token_id } });
    res.status(200).json({ message: "success" })
  },
  notify: async (req, res) => {
    const doctorid = req.doctor.doctorId
    const appointmentid = req.params.id
    const appointment = await Appointment.findOne({ where: { appointment_id: appointmentid } });
    const user = await User.findOne({ where: { user_id: appointment.user_id } });
    res.status(200).json({ message: "success" })
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
        return res.status(200).json({ token, role: "admin", user: { id: admin.admin_id, email: admin.email, name: "Admin" } });
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
      return res.status(200).json({ token, role: "doctor", user: { id: doctor.doctor_id, email: doctor.email, name: doctor.first_name, last: doctor.last_name, img: doctor.image } });
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

        const { name, time } = tokenInfo;
        if (!name) {
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
    res.status(200).json({ tokens: Tokens });
  },
  appointments: async (req, res) => {
    const doctorid = req.doctor.doctorId;
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search;
    const date = req.query.date;

    const whereCondition = {
      doctor_id: doctorid,
      status: ['scheduled', 'pending']
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

