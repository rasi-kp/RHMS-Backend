// controllers/exampleController.js
const ExampleModel = require('../model/user');

exports.getExampleData = async (req, res) => {
  try {
    const data = await ExampleModel.fetchData();
    console.log("Success");
    res.json(data);
  } catch (error) {
    console.log("Success");
    res.status(500).json({ error: 'Internal server error' });
  }
};
