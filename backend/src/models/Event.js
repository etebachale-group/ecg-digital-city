const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Event = sequelize.define('Event', {
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
  eventType: {
    type: DataTypes.ENUM('networking', 'conference', 'workshop', 'hackathon', 'job_fair', 'social'),
    allowNull: false
  },
  districtSlug: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  maxAttendees: {
    type: DataTypes.INTEGER,
    defaultValue: 50
  },
  organizerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'ongoing', 'completed', 'cancelled'),
    defaultValue: 'scheduled'
  }
}, {
  tableName: 'events',
  timestamps: true,
  underscored: true
})

module.exports = Event
