// controllers/exampleController.js
const bcrypt = require('bcrypt');

// require('../model/patients')
const OTP=require('../model/otp')
const User=require('../model/user')
const uhelper=require('../helpers/userhelpers')
// require('../model/admin')
// require('../model/doctor')
// require('../model/AvailableToken')
// require('../model/appointment')



module.exports={
  getExampleData : async (req, res) => {
    res.send("hello")
  },
  signup: async (req,res)=>{
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
      }
      const existingUnverifiedUser = await User.findOne({ where: { email: userData.email,isEmailVerified: false } });
      if (existingUnverifiedUser) {
        // Email exists but is not verified, delete the existing user's data
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
  login:async()=>{
    try {
      const { email, password } = req.body;
      try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        if (!user.isActive) {
          return res.status(403).json({ error: "Account is not active. Please contact the admin." });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return res.status(401).json({ error: "Invalid password" });
        }
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
        // Return the token and user data
        return res.status(200).json({ token, user: { id: user.id, email: user.email, name: user.name } });
      } catch (error) {
        console.error('Error logging in:', error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      if (!usercheck) {
        return res.status(400).json({ error: "Invalid username" });
      }
      else {
        const passwordmatch = await bcrypt.compare(req.body.password, usercheck.password)
        if (passwordmatch) {
          const token = jwt.sign({ id: usercheck.id }, 'rasi_secret_key', { expiresIn: '30d' });
          if (usercheck.role == 'admin') {
            return res.json({ token, success: "admin", user: "Admin" });
          } else if (usercheck.status == "block") {
            return res.status(400).json({ token, error: "Admin blocked" });
          }
          else
            return res.json({ token, success: "success", user: usercheck.name });
        }
        else {
          return res.status(400).json({ error: "Invalid password" });
        }
      }
    } catch {
      return res.status(500).json({ error: "Internal server error" });
    }
  },
}

