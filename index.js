// index.js
const express = require('express');
const dotenv = require('dotenv');

const routes = require('./routes/main');
require('./config/database');

dotenv.config();
const app = express();
// Use routes
app.use('/', routes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
