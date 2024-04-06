var express = require('express');
var router = express.Router();
const isAuth=require('../middleware/isAuth')
const {login,}=require('../controllers/doctorcontroller')

// router.post('/signup',signup)
router.post('/login',login)


module.exports = router;