// index.js
const express = require('express');
const dotenv = require('dotenv');

const main = require('./routes/main');
const admin =require("./routes/users")
const user=require("./routes/admin")
const patient=require("./routes/patients")
const doctor=require("./routes/doctors")
require('./config/database');

dotenv.config();
const app = express();
// Use routes
app.use('/', main);
app.use('/patient', patient);
// app.use('/user', user);
// app.use('/doctor', doctor);
// app.use('/admin', admin);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
