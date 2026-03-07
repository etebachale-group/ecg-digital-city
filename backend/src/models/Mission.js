const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Mission = sequelize.define('Mission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  missionType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'mission_type'
  },
  targetValue: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'target_value'
  },
  xpReward: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'xp_reward'
  },
  isDaily: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'missions',
  timestamps: true,
  underscored: true
})

module.exports = Mission
