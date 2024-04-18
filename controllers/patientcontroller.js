const { Op } = require('sequelize');

const Sequelize = require('sequelize');
const Doctor = require('../model/doctor')
const Patient = require("../model/patients")
// require('../model/AvailableToken')
// require('../model/appointment')

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
    const patients = await Patient.findAll({ where: whereCondition ,order: [['createdAt', 'DESC']] });
    const totalPages = Math.ceil(patients.length / 5);
    const startIndex = (page - 1) * 5;
    const endIndex = page * 5;

    const paginatedPatients = patients.slice(startIndex, endIndex);
    return res.status(200).json({ 
      page: page,
      limit: 5,
      totalPages: totalPages,
      data: paginatedPatients});
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
    const doctors = await Doctor.findAll({ where: whereCondition, order: [['createdAt', 'DESC']] });
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
      const {patient_id, first_name, last_name, date_of_birth, blood_group, age, weight, height, gender } = req.body;
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
      const newUser = await Patient.update(userData,{where: {
        patient_id: patient_id,
        user_id: userid
    },});
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
}

