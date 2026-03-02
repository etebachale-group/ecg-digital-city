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
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'general'
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: '🏆'
  },
  xpReward: {
    type: DataTypes.INTEGER,
    defaultValue: 50
  },
  requirementType: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  requirementValue: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'achievements',
  timestamps: true,
  underscored: true
})

module.exports = Achievement
