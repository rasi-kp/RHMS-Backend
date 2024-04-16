var express = require('express');
var router = express.Router();
const file=require('../config/multerdoctor')
const isAuthAdmin=require('../middleware/isAuthAdmin')
const {adddoctor,deletedoctor,blockdoctor,unblockdoctor,alldoctor}=require('../controllers/admincontroller')

// router.post('/signup',signup)
router.post('/adddoctor',isAuthAdmin,file.single('image'), adddoctor);
router.get('/alldoctor',isAuthAdmin,alldoctor)
router.get('/deletedoctor/:id',deletedoctor)
router.get('/blockdoctor/:id',blockdoctor)
router.get('/unblockdoctor/:id',unblockdoctor)


module.exports = router;