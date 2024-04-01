// controllers/exampleController.js
const ExampleModel = require('../model/user');
const login=require('../model/users')

module.exports={
  getExampleData : async (req, res) => {
    try {
      // const insert=await ExampleModel.admin()
      const data = await ExampleModel.fetchData();
      // const data1 = await ExampleModel.createtableuser();
      res.json(data);
    } catch (error) {
      console.error(error);
      console.log("error");
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  signup:async()=>{
    const datas = {
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
      subscription: false,
      isActive: true
    }
    const existuser = await login.signupc(datas.email)
    if (/\s/.test(datas.username)) {
      return res.status(400).json({ error: "Space not allowed" });
    }
    else if (existuser) {
      return res.status(400).json({ error: "Email Already Exist" });
    }
    else {
      // const saltRounds = 10;
      // const hashpassword = await bcrypt.hash(req.body.password, saltRounds)
      // datas.password = hashpassword
      // const result = await collection.insertOne(datas)
      const result = await login.insert(datas)
      return res.status(200).json({ user: datas.name });
    }
  },
  login:async()=>{
    try {
      const usercheck = await login.signupc(req.body.email)
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

