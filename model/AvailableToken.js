const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AvailableToken = sequelize.define('AvailableToken', {
  token_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Doctors',
      key: 'doctor_id'
    }
  },
  token_no: {
    type: DataTypes.INTEGER
  },
  date: {
    type: DataTypes.DATEONLY // This column will store only the date without time
  },
  time: {
    type: DataTypes.TIME // This column will store only the time without date
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  status: {
    type: DataTypes.STRING
  }
});

// Sync the model with the database
(async () => {
  try {
    await AvailableToken.sync({ alter: true });
    console.log('AvailableToken table updated!');
  } catch (error) {
    console.error('Error syncing available_tokens table:', error);
  }
})();

module.exports = AvailableToken;
