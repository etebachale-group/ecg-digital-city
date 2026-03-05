const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InteractionQueue = sequelize.define('InteractionQueue', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  objectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'object_id'
  },
  nodeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'node_id'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'joined_at'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'expires_at'
  }
}, {
  tableName: 'interaction_queue',
  timestamps: false
});

module.exports = InteractionQueue;
