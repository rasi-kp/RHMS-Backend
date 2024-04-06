const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Doctor = sequelize.define('Doctor', {
  doctor_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
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
  gender: {
    type: DataTypes.STRING
  },
  mob_no: {
    type: DataTypes.STRING
  },
  qualification: {
    type: DataTypes.STRING
  },
  department: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  address: {
    type: DataTypes.TEXT
  },
  specialization: {
    type: DataTypes.STRING
  },
  joining_date: {
    type: DataTypes.DATEONLY
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

// Sync the model with the database
(async () => {
  try {
    await Doctor.sync({ alter: true });
    console.log('Doctor table updated!');
  } catch (error) {
    console.error('Error syncing doctor table:', error);
  }
})();

module.exports = Doctor;
