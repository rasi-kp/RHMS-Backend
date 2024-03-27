// models/exampleModel.js
const db = require('../config/query');

module .exports={
  fetchData : async () => {
    console.log("inside model");
    const result = await db.query('SELECT * FROM users');
    console.log(result);
    return result
  }
}