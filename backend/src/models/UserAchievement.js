const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const UserAchievement = sequelize.define('UserAchievement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  achievementId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'achievements',
      key: 'id'
    }
  },
  unlockedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_achievements',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'achievement_id']
    }
  ]
})

module.exports = UserAchievement
