const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InteractionLog = sequelize.define('InteractionLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  objectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'object_id'
  },
  interactionType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'interaction_type'
  },
  success: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'error_message'
  },
  xpGranted: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'xp_granted'
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'interaction_logs',
  timestamps: false
});

module.exports = InteractionLog;
