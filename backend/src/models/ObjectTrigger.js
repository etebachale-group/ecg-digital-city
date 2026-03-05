const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ObjectTrigger = sequelize.define('ObjectTrigger', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  objectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'object_id'
  },
  triggerType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'trigger_type',
    validate: {
      isIn: [['state_change', 'grant_xp', 'unlock_achievement', 'teleport']]
    }
  },
  triggerData: {
    type: DataTypes.JSONB,
    allowNull: false,
    field: 'trigger_data'
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  condition: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'object_triggers',
  timestamps: true,
  underscored: true
});

module.exports = ObjectTrigger;
