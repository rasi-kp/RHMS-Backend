const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  appointment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Patients',
      key: 'patient_id'
    }
  },
  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Doctors',
      key: 'doctor_id'
    }
  },
  token_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'AvailableTokens',
      key: 'token_id'
    }
  },
  appointment_datetime: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.STRING
  }
});

// Sync the model with the database
(async () => {
  try {
    await Appointment.sync({ alter: true });
    console.log('Appointment table updated!');
  } catch (error) {
    console.error('Error syncing appointments table:', error);
  }
})();

module.exports = Appointment;
