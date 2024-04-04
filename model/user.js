const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const OTP=require('./otp')

sequelize.options.logging = false;

const Users = sequelize.define('Users', {
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
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false // Column to indicate whether the email is verified
  },
});

// Sync the model with the database
(async () => {
  try {
    await Users.sync({ alter: true });
    console.log('User table updated!');
  } catch (error) {
    console.error('Error syncing user table:', error);
  }
})();

module.exports = Users;
