// index.js
const express = require('express');
const dotenv = require('dotenv');
var logger = require('morgan');
const bodyParser = require('body-parser');
var cors =require('cors')

const main = require('./routes/main');
const admin =require("./routes/admin")
const user=require("./routes/users")
const patient=require("./routes/patients")
const doctor=require("./routes/doctors")
require('./config/database');

dotenv.config();
const app = express();
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Use routes
app.use('/', main);
app.use('/patient', patient);
app.use('/user', user);
// app.use('/doctor', doctor);
// app.use('/admin', admin);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
