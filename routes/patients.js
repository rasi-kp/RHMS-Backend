// routes/exampleRoutes.js
const express = require('express');
const router = express.Router();
const isAuth=require('../middleware/isAuth')
const {dashboard,allp,addp,deletep,editp,editpost,addappointment,
    alldoctor,alltoken,appointments,cappointment,dappointment,rappointment,
    viewmonitor,prescription,} = require('../controllers/patientcontroller');

router.get('/dashboard',isAuth,dashboard)
router.get('/all',isAuth,allp)
router.post('/add',isAuth,addp)
router.get('/delete/:id',isAuth,deletep)
router.get('/edit/:id',isAuth,editp)
router.post('/edit',isAuth,editpost)
router.get('/alldoctor',isAuth,alldoctor)
router.get('/alltokens',isAuth,alltoken)
router.post('/addappointment',isAuth,addappointment)
router.get('/appointments',isAuth,appointments)
router.get('/completeappointment',isAuth,cappointment)
router.get('/deleteappointment/:id',isAuth,dappointment)
router.get('/rescheduleappointment',isAuth,rappointment)
router.get('/viewmonitor',isAuth,viewmonitor)
router.get('/prescription/:id',isAuth,prescription)
// router.post('/message',isAuth,message)
// router.get('/message',isAuth,message_get)

module.exports = router;
