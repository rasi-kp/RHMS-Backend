const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database'); // Assuming you have a database connection setup

const Patient = sequelize.define('Patient', {
  patient_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'user_id'
    }
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  blood_group: {
    type: DataTypes.STRING
  },
  age: {
    type: DataTypes.INTEGER
  },
  height: {
    type: DataTypes.INTEGER
  },
  weight: {
    type: DataTypes.INTEGER
  },
  gender: {
    type: DataTypes.STRING
  }
});

// Sync the model with the database
(async () => {
  try {
    await Patient.sync({ alter: true });
    console.log('Patient table created!');
  } catch (error) {
    console.error('Error syncing patient table:', error);
  }
})();

module.exports = Patient;
