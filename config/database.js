// // src/database.js
// require('dotenv').config();
// const { Pool } = require('pg');

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

// pool.on('error', (err) => {
//   console.error('Unexpected error on idle client', err);
//   process.exit(-1);
// });
// console.log("Database Connection success");



// module.exports = { pool };
const { Sequelize } = require('sequelize');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres', // Or any other dialect (e.g., 'mysql')
});

module.exports = { sequelize };
