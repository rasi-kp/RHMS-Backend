// models/exampleModel.js
const db = require('../config/database');

exports.fetchData = async () => {
  const result = await db.query('SELECT * FROM test');
  return result.rows;
};
