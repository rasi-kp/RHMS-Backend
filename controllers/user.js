// controllers/exampleController.js
const ExampleModel = require('../model/user');

exports.getExampleData = async (req, res) => {
  try {
    const data = await ExampleModel.fetchData();
    console.log("Success");
    console.log(data);
    res.json(data);
  } catch (error) {
    console.error(error);
    console.log("error");
    res.status(500).json({ error: 'Internal server error' });
  }
};
