const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const UserMission = sequelize.define('UserMission', {
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
  missionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'missions',
      key: 'id'
    }
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  assignedDate: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_missions',
  timestamps: true,
  underscored: true
})

module.exports = UserMission
