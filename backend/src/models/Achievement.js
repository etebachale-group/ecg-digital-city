const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Achievement = sequelize.define('Achievement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: '🏆'
  },
  xpReward: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
    field: 'xp_reward'
  },
  requirementType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'requirement_type'
  },
  requirementValue: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'requirement_value'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'achievements',
  timestamps: true,
  underscored: true
})

module.exports = Achievement
