const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database'); // Assuming you have a database connection setup

const Admin = sequelize.define('Admin', {
  admin_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

async function syncAdminTable() {
  try {
    // Check if the table already exists in the database
    const tableExists = await sequelize.getQueryInterface().showAllTables();
    
    if (!tableExists.includes('Admin')) {
      // If the table doesn't exist, create it
      await Admin.sync({ alter: true });
      console.log('Admin table created!');
    } else {
      console.log('Admin table already exists.');
    }
  } catch (error) {
    console.error('Error syncing admin table:', error);
  }
}

// Call the sync function
syncAdminTable();

module.exports = Admin;
