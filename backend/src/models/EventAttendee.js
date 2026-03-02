const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const EventAttendee = sequelize.define('EventAttendee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'events',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('registered', 'attended', 'no_show'),
    defaultValue: 'registered'
  },
  registeredAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  checkedInAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'event_attendees',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['event_id', 'user_id']
    }
  ]
})

module.exports = EventAttendee
