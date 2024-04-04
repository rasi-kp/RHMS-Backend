var express = require('express');
var router = express.Router();
const isAuth=require('../middleware/isAuth')
const {signup,login,validateotp}=require('../controllers/usercontroller')
/* GET home page. */

router.post('/signup',signup)
router.post('/login',login)
router.post('/validateotp',validateotp)
// router.post('/editUser',isAuth,updateUser)
// router.get('/home',isAuth,home)
// router.post('/deleteUser',isAuth,deleteUser)
// router.get('/getUser',isAuth,getUser)
// router.get('/getUser/:id',isAuth,getUserid)
// router.post('/updateProfile',isAuth,updateProfile)
// router.post('/message',isAuth,message)
// router.get('/message',isAuth,message_get)

module.exports = router;
