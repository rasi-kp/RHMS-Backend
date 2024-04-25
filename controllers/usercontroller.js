const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const OTP = require('../model/otp')
const User = require('../model/user')
const uhelper = require('../helpers/userhelpers')
const Doctor=require('../model/doctor')
const AvailableToken= require('../model/AvailableToken')


module.exports = {
  getExampleData: async (req, res) => {
    res.send("hello")
  },
  doctors:async(req,res)=>{
    const doctors = await Doctor.findAll({
      attributes: ['doctor_id','first_name', 'last_name', 'specialization', 'department', 'image', 'qualification'],
      order: [['createdAt', 'DESC']]
  });
    return res.status(200).json({ doctors:doctors });
  },
  viewtoken:async(req,res)=>{
    const doctorid = req.query.doctorid
    const date = req.query.date;

    const [day, month, year] = date.split('-');
    const formattedDate = `${year}-${month}-${day}`;
    const Tokens = await AvailableToken.findAll({
      attributes: ['token_no'],
      where: {
        doctor_id: doctorid,
        date: formattedDate,
        is_available: true
      },
    });
    res.status(200).json({ tokens: Tokens });
  },
  signup: async (req, res) => {
    if (!req.body.email || !req.body.name || !req.body.password) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const otpExpiryTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    const generatedotp = await uhelper.generateOTP();
    const otpExpiry = new Date(Date.now() + otpExpiryTime);
    const userData = {
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
      subscription: false,
      isActive: true,
    };
    try {
      const existingUser = await User.findOne({ where: { email: userData.email, isEmailVerified: true } });
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      } else {
        const existingUnverifiedUser = await User.findOne({ where: { email: userData.email, isEmailVerified: false } });
        if (existingUnverifiedUser) {
          await User.destroy({ where: { email: userData.email } });
        }
        await uhelper.sendOTPEmail(req.body.email, generatedotp);
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        userData.password = hashedPassword;
        const newUser = await User.create(userData);
        await OTP.create({
          otp: generatedotp,
          expireTime: otpExpiry,
          userId: newUser.user_id
        });
        return res.status(200).json({ userid: newUser.user_id });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
  validateotp: async (req, res) => {
    const otpRecord = await OTP.findOne({ where: { userId: req.body.id } });
    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    if (req.body.otp !== otpRecord.otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    // Check if the OTP has expired
    if (Date.now() > otpRecord.expireTime) {
      return res.status(400).json({ error: "OTP has expired" });
    }
    await User.update({ isEmailVerified: true }, { where: { user_id: req.body.id } });
    return res.status(200).json({ message: "OTP verified successfully" });
  },
  login: async (req,res) => {
    try {
      const { email, password } = req.body;
      try {
        const user = await User.findOne({ where: { email:email, isEmailVerified: true } });
        if (!user) {
          return res.status(404).json({ error: "Invalied Email ID" });
        }
        if (!user.isActive) {
          return res.status(403).json({ error: "Account is not active. Please contact the admin." });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return res.status(401).json({ error: "Invalid password" });
        }
        const token = jwt.sign({ userId: user.user_id ,email:user.email}, process.env.JWT_SECRET, { expiresIn: '30d' });
        return res.status(200).json({ token, role:"patient", user: { id: user.id, email: user.email, name: user.name } });
      } catch (error) {
        console.error('Error logging in:', error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    } catch {
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  forgotten:async(req,res)=>{
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "Invalied Email ID" });
    }
    const otpExpiryTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    const generatedotp = await uhelper.generateOTP();
    const otpExpiry = new Date(Date.now() + otpExpiryTime);
    const otpRecord = await OTP.create({
      otp: generatedotp,
      expireTime: otpExpiry,
      userId: user.user_id
    });
    await uhelper.sendOTPEmail(email, generatedotp);
    return res.status(200).json({ message: "OTP sent successfully" });
  },
  forgottenv:async(req,res)=>{
    try {
      const { email, otp, password } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const otpRecord = await OTP.findOne({ where: { userId: user.user_id, otp } });
      if (!otpRecord || otpRecord.expireTime < new Date()) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      await user.save();
      await otpRecord.destroy();
      return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error('Error in forgotten password verification:', error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
}

