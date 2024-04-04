const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database'); // Assuming you have a database connection setup

const OTP = sequelize.define('OTP', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: false
    },
    expireTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    userId: { // Define foreign key for association with user
        type: DataTypes.INTEGER,
        allowNull: false
    }
  });
  (async () => {
    try {
      await OTP.sync({ alter: true });
      console.log('otp table updated!');
    } catch (error) {
      console.error('Error syncing user table:', error);
    }
  })();
  module.exports = OTP;
