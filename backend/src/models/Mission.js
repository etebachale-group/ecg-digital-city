const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Mission = sequelize.define('Mission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  missionType: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    defaultValue: 'easy'
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
