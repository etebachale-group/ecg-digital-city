const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Avatar = sequelize.define('Avatar', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  skinColor: {
    type: DataTypes.STRING(20),
    defaultValue: '#fdbcb4',
    field: 'skin_color'
  },
  hairStyle: {
    type: DataTypes.STRING(50),
    defaultValue: 'short',
    field: 'hair_style'
  },
  hairColor: {
    type: DataTypes.STRING(20),
    defaultValue: '#000000',
    field: 'hair_color'
  },
  shirtColor: {
    type: DataTypes.STRING(20),
    defaultValue: '#3498db',
    field: 'shirt_color'
  },
  pantsColor: {
    type: DataTypes.STRING(20),
    defaultValue: '#2c3e50',
    field: 'pants_color'
  },
  accessories: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  currentState: {
    type: DataTypes.STRING(50),
    defaultValue: 'idle',
    field: 'current_state',
    validate: {
      isIn: [['idle', 'walking', 'running', 'sitting', 'interacting', 'dancing']]
    }
  },
  previousState: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'previous_state'
  },
  stateChangedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'state_changed_at'
  },
  interactingWith: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'interacting_with'
  },
  sittingAt: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'sitting_at'
  }
}, {
  tableName: 'avatars',
  timestamps: true,
  underscored: true
});

module.exports = Avatar;
