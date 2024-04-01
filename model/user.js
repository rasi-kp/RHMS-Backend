// models/exampleModel.js
// const db = require('../config/query');
// const { pool } = require('./database');

// module .exports={
//   fetchData : async () => {
//     console.log("inside model");
//     const result = await db.query('SELECT * FROM users');
//     console.log(result);
//     return result
//   },
//   doctorlogin:async()=>{
//     const queryText = `
//       CREATE TABLE doctor_login (
//         doctor_id SERIAL PRIMARY KEY,
//         password VARCHAR(255),
//         isActive BOOLEAN
//       )
//     `;
//     const result = await db.query(queryText);
//   },
//   admin:async()=>{
//     const queryText = `
//     CREATE TABLE admin (
//       admin_id SERIAL PRIMARY KEY,
//       password VARCHAR(255)
//     )
//   `;
//   const result = await db.query(queryText);
//   },
//   doctortable:async()=>{
//     const queryText = `
//       CREATE TABLE doctors (
//         doctor_id SERIAL PRIMARY KEY,
//         doctor_login INT REFERENCES doctor_login(doctor_id),
//         first_name VARCHAR(255),
//         last_name VARCHAR(255),
//         date_of_birth DATE,
//         gender VARCHAR(10),
//         contact_number VARCHAR(20),
//         qualification VARCHAR(255),
//         department VARCHAR(255),
//         email VARCHAR(255),
//         address TEXT,
//         specialization VARCHAR(255)
//       )
//     `;
//     const result = await db.query(queryText);
//   },
//   createtableuser:async()=>{
//     const queryText = `
//       CREATE TABLE users (
//         user_id SERIAL PRIMARY KEY,
//         name VARCHAR(255),
//         email VARCHAR(255),
//         password VARCHAR(255),
//         subscription BOOLEAN,
//         isActive BOOLEAN
//       )
//     `;
//     const result = await db.query(queryText);
//     console.log('Table created successfully:', result);
//   },
//   createtablepatients:async()=>{
//     const queryText = `
//       CREATE TABLE patients (
//         patient_id SERIAL PRIMARY KEY,
//         user_id INT REFERENCES users(user_id),
//         first_name VARCHAR(255),
//         last_name VARCHAR(255),
//         date_of_birth DATE,
//         blood_group VARCHAR(10),
//         age INT,
//         height INT,
//         weight INT,
//         gender VARCHAR(10)
//       )
//     `;
//     const result = await db.query(queryText);
//     console.log('Patients table created successfully:', result);
//   },
//   insertdata:async()=>{
//     const queryText = `
//       INSERT INTO users (name, email, password, subscription, isActive)
//       VALUES ($1, $2, $3, $4, $5)
//     `;
//     const values = ['RasiTest', 'rasi@gmail.com', '123', false, true];

//     const result = await db.query(queryText, values);
//     console.log('Data inserted successfully:', result);
//   }
// }

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subscription: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sub_start_date: {
    type: DataTypes.DATE
  },
  sub_end_date: {
    type: DataTypes.DATE
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

(async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database & tables created!');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
})();

module.exports = User;
