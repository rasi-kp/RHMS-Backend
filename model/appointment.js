const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Patient = require('./patients')
const Token=require('./AvailableToken')
const Doctor=require('./doctor')

const Appointment = sequelize.define('Appointment', {
  appointment_id: {
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
  date: {
    type: DataTypes.DATEONLY // This column will store only the date without time
  },
  time: {
    type: DataTypes.TIME // This column will store only the time without date
  },
  status: {
    type: DataTypes.STRING
  }
});
// Appointment belongs to Users
Appointment.belongsTo(Patient, {
  foreignKey: 'patient_id', // Foreign key in the Appointment model
  as: 'patient' // Alias to refer to the Users model
});
Appointment.belongsTo(Token,{
  foreignKey: "token_id",
  as: "token"
});
Appointment.belongsTo(Doctor,{
  foreignKey:"doctor_id",
  as: "doctor"
});
Patient.hasMany(Appointment, {
  foreignKey: 'patient_id', // Use your actual foreign key
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
