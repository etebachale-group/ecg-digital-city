const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const UserProgress = sequelize.define('UserProgress', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  xp: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  totalLogins: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalMessages: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalDistrictsVisited: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalEventsAttended: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  streakDays: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastLogin: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  // Campos virtuales para el frontend
  currentXP: {
    type: DataTypes.VIRTUAL,
    get() {
      const level = this.getDataValue('level') || 1
      const totalXP = this.getDataValue('xp') || 0
      return totalXP - ((level - 1) * 100)
    }
  },
  xpToNextLevel: {
    type: DataTypes.VIRTUAL,
    get() {
      return 100
    }
  }
}, {
  tableName: 'user_progress',
  timestamps: true,
  underscored: true
})

module.exports = UserProgress
