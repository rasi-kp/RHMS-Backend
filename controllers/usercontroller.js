// controllers/exampleController.js
const bcrypt = require('bcrypt');

// require('../model/patients')
const User=require('../model/user')
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
    const generatedotp = await otp.generateOTP();
    const otpExpiry = Date.now() + otpExpiryTime;
    const userData = {
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
      subscription: false,
      isActive: false
    };
    try {
      // Check if the user already exists
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      userData.password = hashedPassword;
      // Create a new user
      const newUser = await User.create(userData);
      return res.status(200).json({ user: newUser.name });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
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

