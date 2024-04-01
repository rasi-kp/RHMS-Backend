// routes/exampleRoutes.js
const express = require('express');
const router = express.Router();
const exampleController = require('../controllers/usercontroller');

router.get('/', exampleController.getExampleData);

module.exports = router;
