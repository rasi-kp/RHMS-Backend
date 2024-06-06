const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

const Sequelize = require('sequelize');
const Doctor = require('../model/doctor')
const Patient = require("../model/patients");
const Admin = require('../model/admin');
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
    const adminid = req.admin.AdminID
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
  manualadddoctor:async(req,res)=>{
    const doctors = [
      {
        doctor_id: 1000,
        email: "rasir239@gmail.com",
        password: "$2b$10$YrcMKUSQOgu1BkpM/RpRI.jxb6l6Uuw0aBjs93Q5bWwPKOT4ChR0q",
        first_name: "Dr. Rasi",
        last_name: "K P",
        date_of_birth: "2001-10-19",
        gender: "male",
        mob_no: "9605942261",
        qualification: "b-tect",
        department: "neuro",
        address: "ok",
        specialization: "dr",
        joining_date: "2024-04-02",
        isActive: true,
        image: "rasi new-modified.png",
      },
      {
        email: "rasir23@gmail.com",
        password: "$2b$10$oEQy9rPsXXKpdBXkM9lHUuPXS0uc9yVysaifA13ctNa3bus95jV4W",
        first_name: "Dr. rasi",
        last_name: "kp",
        date_of_birth: "2001-03-19",
        gender: "male",
        mob_no: "9961647218",
        qualification: "btech",
        department: "neuro",
        address: "hai",
        specialization: "genral",
        joining_date: "2024-04-14",
        isActive: true,
        image: "rasi new-modified.png",
      },
      {
        email: "johndoe@gmail.com",
        password: "$2b$10$eM5Y5AfZpgqBldarYdYfrO.bLW8Z7nCvc/fZzKgwm//ZnkIv1cTpq",
        first_name: "Dr. John",
        last_name: "Doe",
        date_of_birth: "1997-12-12",
        gender: "male",
        mob_no: "1234567890",
        qualification: "MBBS",
        department: "Surgeon",
        address: "Kannur,kerala",
        specialization: "General physician",
        joining_date: "2024-04-15",
        isActive: true,
        image: "image-1713183576504.jpeg",
      },
      {
        email: "nithinakkal@gmail.com",
        password: "$2b$10$i/me/Kb0wIK3AmJ23cIGQuzmL1zFeic8ODt7amcVofkZnLr2eWJEm",
        first_name: "Dr. Nithin",
        last_name: "Akkal",
        date_of_birth: "2009-10-19",
        gender: "male",
        mob_no: "0987654321",
        qualification: "MBBS ,DNB Emergency Medicine",
        department: "Emergency Medicine",
        address: "kannur,kerala",
        specialization: "Emergency Medicine",
        joining_date: "2024-04-15",
        image: "image-1713183890662.jpeg",
      },
      {
        email: "dony@gmail.com",
        password: "$2b$10$ogOM7B4ZNMBPwitAPCa6YeCo7zP40Xe.794paaeVGEh32sNXlz5J.",
        first_name: "Dr. Sony Salam",
        last_name: "N A",
        date_of_birth: "2009-10-19",
        gender: "male",
        mob_no: "123456234",
        qualification: "EDAIC,MBBS,",
        department: "Consultant",
        address: "kannur,kerala",
        specialization: "Anaesthesiology",
        joining_date: "2024-04-15",
        isActive: true,
        image: "image-1713184087379.jpeg",
      },
      {
        email: "melnajose@gmail.com",
        password: "$2b$10$lDI8JV16si10tkayGX5X0uDpwQYjWkYM6ZuSlAMHzLpQXCk/n8kla",
        first_name: "Dr. Melna",
        last_name: "Jose",
        date_of_birth: "2009-10-19",
        gender: "female",
        mob_no: "5467839282",
        qualification: "MBBS,MD",
        department: "Dermatology",
        address: "kannur,kerala",
        specialization: "Associate consultant",
        joining_date: "2024-04-15",
        isActive: true,
        image: "image-1713184308302.jpeg",
      },
      {
        email: "romapaul@gmail.com",
        password: "$2b$10$1RHSrWmiq0FyHHijtBO2uuMrfLlAgBxY2t8.V9z9Y20WFTuUA17uy",
        first_name: "Dr. Roma",
        last_name: "Paul",
        date_of_birth: "2001-10-19",
        gender: "female",
        mob_no: "4342342344",
        qualification: "MBBS",
        department: "gynecologist",
        address: "payyanur,kannur",
        specialization: "gynecologist",
        joining_date: "2024-04-15",
        isActive: true,
        image: "image-1713184447614.jpeg",
      },
      {
        email: "snehlabasheer@gmail.com",
        password: "$2b$10$olp/S5RcZcs8TE78suPe9.yw4XfYEfQizM8uYvZFYMUmYO5bEPF8.",
        first_name: "Dr. Snehla",
        last_name: "Basheer",
        date_of_birth: "2009-10-19",
        gender: "female",
        mob_no: "33313123",
        qualification: "MD",
        department: "Neurologist",
        address: "Thallassery",
        specialization: "Neurologist",
        joining_date: "2024-04-15",
        isActive: true,
        image: "image-1713184545146.jpeg",
      },
      {
        email: "sreedevi@gmail.com",
        password: "$2b$10$TJi6qynKe33B8JVdCOctkeBQf5uHv2N3NozVAhrJ1pfuYW/GeUMsy",
        first_name: "Dr. Sreedevi S",
        last_name: "Nair",
        date_of_birth: "2009-10-19",
        gender: "female",
        mob_no: "5545545455",
        qualification: "MBBS",
        department: "gynecologist",
        address: "Kannur,Kerala",
        specialization: "gynecologist",
        joining_date: "2024-04-15",
        isActive: true,
        image: "image-1713184648611.jpeg",
      },
    ];
    await Doctor.bulkCreate(doctors, { validate: true });
    res.status(200).json({success:"success"})
  },
  adddoctor: async (req, res) => {
    const adminid = req.admin.AdminID
    try {
      const existingdoctor = await Doctor.findOne({ where: { [Op.or]: [{ email: req.body.email }, { mob_no: req.body.mob_no }] } });
      if (existingdoctor) {
        return res.status(200).json({ message: "Doctor already exist" });
      }
      const { email, first_name, last_name, date_of_birth, gender, mob_no, qualification, department, specialization, address } = req.body;
      const mobileLastDigits = mob_no.slice(-5); // Use last 5 digits of mobile number
      const password = `${mobileLastDigits}@hrms`;
      const data = {
        email: email,
        password: password,
        image: req.file.filename,
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
      return res.status(200).json({ success: "success", doctorid: newUser.doctor_id });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
  addadmin:async(req,res)=>{
    const data = {
      email: "admin@gmail.com",
      password: "$2b$10$oOb.gyYoP6mbR3aXHfIOQO7HV783xr.jW1C6CIcWAOBoQl70hg5Gi",
    };
    await Admin.create(data);
    res.status(200).json({ message: "Successfully added admin" });
  }
}

