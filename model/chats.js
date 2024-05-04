const { DataTypes, Sequelize } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('../model/user');
const Doctor = require('../model/doctor');

const Chat = sequelize.define('Chats', {
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
    },
});

// Define associations with Users and Doctors
// Sender can be a Doctor or a User (Patient)
Chat.belongsTo(User, { as: 'SenderUser', foreignKey: 'senderId', constraints: false });
Chat.belongsTo(Doctor, { as: 'SenderDoctor', foreignKey: 'senderId', constraints: false });

// Receiver can be a Doctor or a User (Patient)
Chat.belongsTo(User, { as: 'ReceiverUser', foreignKey: 'receiverId', constraints: false });
Chat.belongsTo(Doctor, { as: 'ReceiverDoctor', foreignKey: 'receiverId', constraints: false });

(async () => {
    try {
        await Chat.sync({ alter: true });
        console.log('Chat table updated!');
    } catch (error) {
        console.error('Error syncing Chat table:', error);
    }
})();

module.exports = Chat;
