const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Permission = sequelize.define('Permission', {
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
  officeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'office_id'
  },
  role: {
    type: DataTypes.ENUM('owner', 'admin', 'employee', 'visitor'),
    defaultValue: 'visitor'
  },
  canEdit: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'can_edit'
  },
  canInvite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'can_invite'
  },
  expiresAt: {
    type: DataTypes.DATE,
    field: 'expires_at'
  }
}, {
  tableName: 'permissions',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'office_id']
    }
  ]
});

module.exports = Permission;
