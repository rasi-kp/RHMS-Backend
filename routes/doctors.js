var express = require('express');
var router = express.Router();
const isAuthdoctor =require('../middleware/isAuthDoctor')
const {login,addtoken,addedtokens,appointments,allpatient,
    absent,accept,notify,cappointment,addprescription,
    messages,allchat,
    getuserid}=require('../controllers/doctorcontroller')

// router.post('/signup',signup)
router.post('/login',login)
router.get('/allpatient',isAuthdoctor,allpatient)
router.post('/addtoken',isAuthdoctor,addtoken)
router.get('/viewtokens/:date',isAuthdoctor,addedtokens)
router.get('/appointment',isAuthdoctor,appointments)
router.get('/cappointment',isAuthdoctor,cappointment)
router.get('/absent/:id',isAuthdoctor,absent)
router.get('/accept/:id',isAuthdoctor,accept)
router.get('/notify/:id',isAuthdoctor,notify)
router.post('/addprescription',isAuthdoctor,addprescription)
router.get('/patient/:id',isAuthdoctor,messages)
router.get('/allchats',isAuthdoctor,allchat) 
router.get('/getuserid/:id',isAuthdoctor,getuserid)



module.exports = router;