// routes/exampleRoutes.js
const express = require('express');
const router = express.Router();
const exampleController = require('../controllers/user');

router.get('/test', exampleController.getExampleData);

module.exports = router;
