const { Op } = require('sequelize');

const Doctor = require('../model/doctor')
const Patient=require("../model/patients")
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
  allp:async(req,res)=>{
    const userid = req.user.userId
    const patients = await Patient.findAll({ where: { user_id:userid} });
    return res.status(200).json({patient:patients});
  },
  deletep:async(req,res)=>{
    const userid = req.user.userId
    const pid = req.params.id;
    const patients = await Patient.delete({ where: { user_id:userid,patient_id:pid} });
    return res.status(200).json({success:"Successfully deleted"});
  },
  editp:async(req,res)=>{
    const userid = req.user.userId
    const pid = req.params.id;
    const patients = await Patient.findOne({ where: { user_id:userid, patient_id:pid} });
    return res.status(200).json({patient:patients});
  },
  editpost:async(req,res)=>{
    const userid = req.user.userId
    try{
      const { fname, lname,dob,bg,age,weight,height,gender } = req.body;
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
    return res.status(200).json({message:"success", userid: newUser.user_id });
    }catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
  addp:async(req,res)=>{
    const userid = req.user.userId
    try{
      const { fname, lname,dob,bg,age,weight,height,gender } = req.body;
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
    return res.status(200).json({message:"success", userid: newUser.user_id });
    }catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
}

