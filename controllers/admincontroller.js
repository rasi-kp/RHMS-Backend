const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

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
  alldoctor: async (req, res) => {
    const userid = req.user.userId
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
  deletedoctor: async (req, res) => {
    const userid = req.user.userId
    const id = req.params.id;
    const patients = await Doctor.destroy({ where: { doctor_id: id } });
    return res.status(200).json({ success: "Successfully deleted" });
  },
  blockdoctor: async (req, res) => {
    try {
      const id = req.params.id;
      await Doctor.update({ isActive: false }, { where: { doctor_id: id } });
      return res.status(200).json({ success: "Doctor successfully blocked" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
  unblockdoctor: async (req, res) => {
    try {
      const id = req.params.id;
      await Doctor.update({ isActive: true }, { where: { doctor_id: id } });
      return res.status(200).json({ success: "Doctor successfully unblocked" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
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
  adddoctor: async (req, res) => {
    const userid = req.user.userId
    try {
      const existingdoctor = await Doctor.findOne({ where: { [Op.or]: [{ email: req.body.email }, { mob_no: req.body.mob_no }] } });
      if (existingdoctor) {
        return res.status(400).json({ error: "Doctor already exist" });
      }
      const { email, first_name, last_name, date_of_birth, gender, mob_no, qualification, department, specialization, address } = req.body;
      const mobileLastDigits = mob_no.slice(-5); // Use last 5 digits of mobile number
      const password = `${mobileLastDigits}@hrms`;
      const data = {
        email: email,
        password: password,
        first_name: `Dr. ${first_name}`,
        last_name: last_name,
        date_of_birth: date_of_birth,
        gender: gender,
        mob_no: mob_no,
        qualification: qualification,
        department: department,
        address: address,
        specialization: specialization,
        joining_date: Date.now(),
        isActive: true
      };
      const hashedPassword = await bcrypt.hash(data.password, 10);
      data.password = hashedPassword;
      const newUser = await Doctor.create(data);
      return res.status(200).json({ message: "success", doctorid: newUser.doctor_id });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
}

