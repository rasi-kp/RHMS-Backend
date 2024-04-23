var express = require('express');
var router = express.Router();
const isAuthdoctor =require('../middleware/isAuthDoctor')
const {login,addtoken,addedtokens,appointments,
    absent,accept,notify,cappointment}=require('../controllers/doctorcontroller')

// router.post('/signup',signup)
router.post('/login',login)
router.post('/addtoken',isAuthdoctor,addtoken)
router.get('/viewtokens/:date',isAuthdoctor,addedtokens)
router.get('/appointment',isAuthdoctor,appointments)
router.get('/cappointment',isAuthdoctor,cappointment)
router.get('/absent/:id',isAuthdoctor,absent)
router.get('/accept/:id',isAuthdoctor,accept)
router.get('/notify/:id',isAuthdoctor,notify)



module.exports = router;