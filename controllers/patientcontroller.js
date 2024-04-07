const { Op } = require('sequelize');

const Doctor = require('../model/doctor')
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

  },
  deletep:async(req,res)=>{

  },
  editp:async(req,res)=>{

  },
  editpost:async(req,res)=>{

  },
  addp:async(req,res)=>{

  },
}

