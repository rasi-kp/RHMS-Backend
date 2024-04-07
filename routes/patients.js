// routes/exampleRoutes.js
const express = require('express');
const router = express.Router();
const isAuth=require('../middleware/isAuth')
const {dashboard,allp,addp,deletep,editp,editpost,} = require('../controllers/patientcontroller');

router.get('/dashboard',isAuth,dashboard)
router.get('/patients',isAuth,allp)
router.post('/patients/add',isAuth,addp)
router.get('/patient/delete/:id',isAuth,deletep)
router.get('/patient/:id',isAuth,editp)
router.post('/patient/edit',isAuth,editpost)
// router.post('/updateProfile',isAuth,updateProfile)
// router.post('/message',isAuth,message)
// router.get('/message',isAuth,message_get)

module.exports = router;
