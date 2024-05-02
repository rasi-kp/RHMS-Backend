const { DataTypes, Sequelize } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('../model/user'); // Import the User model (assuming it includes both doctors and patients)

const Chat = sequelize.define('Chat', {
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User, // Specify the User model for reference
            key: 'id',
        },
    },
    receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User, // Specify the User model for reference
            key: 'id',
        },
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
    },
}, {
    tableName: 'chats', // Specify the table name
    timestamps: false, // Disable Sequelize's automatic timestamp fields if not needed
});

// Define associations
Chat.belongsTo(User, { as: 'Sender', foreignKey: 'senderId' });
Chat.belongsTo(User, { as: 'Receiver', foreignKey: 'receiverId' });

module.exports = Chat;
