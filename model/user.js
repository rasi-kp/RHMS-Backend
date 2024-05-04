const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

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
  last_name: {
    type: DataTypes.STRING,
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
  phone_no: {
    type: DataTypes.STRING,
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
  address: {
    type: DataTypes.STRING,
  },
  blood_group: {
    type: DataTypes.STRING,
  },
  gender: {
    type: DataTypes.STRING,
  },
  date_of_birth: {
    type: DataTypes.STRING,
  },
  image: {
    type: DataTypes.STRING,
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
