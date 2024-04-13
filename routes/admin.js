var express = require('express');
var router = express.Router();
const isAuth=require('../middleware/isAuth')
const {adddoctor,deletedoctor,blockdoctor,unblockdoctor,alldoctor}=require('../controllers/admincontroller')

// router.post('/signup',signup)
router.post('/adddoctor',isAuth,adddoctor)
router.get('/alldoctor',isAuth,alldoctor)
router.get('/deletedoctor/:id',isAuth,deletedoctor)
router.get('/blockdoctor/:id',isAuth,blockdoctor)
router.get('/unblockdoctor/:id',isAuth,unblockdoctor)


module.exports = router;