var express = require('express');
var router = express.Router();
const {signup,login,validateotp,forgotten,forgottenv,doctors}=require('../controllers/usercontroller')
/* GET home page. */

router.post('/signup',signup)
router.post('/login',login)
router.post('/validateotp',validateotp)
router.post('/forgotten',forgotten)
router.post('/forgottenverify',forgottenv)
router.get('/doctors',doctors)

module.exports = router;
