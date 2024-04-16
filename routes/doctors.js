var express = require('express');
var router = express.Router();
const isAuth=require('../middleware/isAuth')
const isAuthdoctor =require('../middleware/isAuthDoctor')
const {login,addtoken}=require('../controllers/doctorcontroller')

// router.post('/signup',signup)
router.post('/login',login)
router.post('/addtoken',isAuthdoctor,addtoken)


module.exports = router;