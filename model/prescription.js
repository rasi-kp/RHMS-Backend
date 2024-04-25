const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Patient = require('./patients')
const Doctor = require('./doctor');
const Appointment = require('./appointment');

const Prescription = sequelize.define('Prescription', {
    prescription_id: {
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
    appointment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Appointments',
            key: 'appointment_id'
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
    observation: {
        type: DataTypes.STRING,
    },
    tablets: {
        type: DataTypes.JSON,
    },
    test: {
        type: DataTypes.STRING,
    }
});
Prescription.belongsTo(Patient, {
    foreignKey: 'patient_id',
    as: 'patient' 
});
Prescription.belongsTo(Appointment, {
    foreignKey: "appointment_id",
    as: "appointment"
});
Appointment.belongsTo(Doctor, {
    foreignKey: "doctor_id",
    as: "prescribeddoctor"
});
(async () => {
    try {
        await Prescription.sync({ alter: true });
        console.log('Prescription table updated!');
    } catch (error) {
        console.error('Error syncing appointments table:', error);
    }
})();

module.exports = Prescription;
