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
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  currentXp: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'current_xp'
  },
  totalXp: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_xp'
  },
  streakDays: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'streak_days'
  },
  lastDailyLogin: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'last_daily_login'
  },
  // Alias for backward compatibility
  xp: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('totalXp') || 0
    },
    set(value) {
      this.setDataValue('totalXp', value)
    }
  },
  lastLogin: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue('lastDailyLogin')
    },
    set(value) {
      this.setDataValue('lastDailyLogin', value)
    }
  },
  // Virtual fields for stats (can be added to DB later if needed)
  totalLogins: {
    type: DataTypes.VIRTUAL,
    get() {
      return 0 // Placeholder
    }
  },
  totalMessages: {
    type: DataTypes.VIRTUAL,
    get() {
      return 0 // Placeholder
    }
  },
  totalDistrictsVisited: {
    type: DataTypes.VIRTUAL,
    get() {
      return 0 // Placeholder
    }
  },
  totalEventsAttended: {
    type: DataTypes.VIRTUAL,
    get() {
      return 0 // Placeholder
    }
  },
  // Frontend helper fields
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
