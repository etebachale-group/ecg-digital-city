const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OfficeObject = sequelize.define('OfficeObject', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  officeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'office_id'
  },
  objectType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'object_type'
  },
  position: {
    type: DataTypes.JSONB,
    defaultValue: { x: 0, y: 0, z: 0 }
  },
  rotation: {
    type: DataTypes.JSONB,
    defaultValue: { x: 0, y: 0, z: 0 }
  },
  scale: {
    type: DataTypes.JSONB,
    defaultValue: { x: 1, y: 1, z: 1 }
  },
  color: {
    type: DataTypes.STRING(20),
    defaultValue: '#ffffff'
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'created_by'
  }
}, {
  tableName: 'office_objects',
  timestamps: true,
  underscored: true
});

module.exports = OfficeObject;
