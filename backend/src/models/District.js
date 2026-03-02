const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const District = sequelize.define('District', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT
  },
  position: {
    type: DataTypes.JSONB,
    defaultValue: { x: 0, y: 0, z: 0 }
  },
  size: {
    type: DataTypes.JSONB,
    defaultValue: { width: 100, height: 100, depth: 100 }
  },
  maxOffices: {
    type: DataTypes.INTEGER,
    defaultValue: 20,
    field: 'max_offices'
  },
  theme: {
    type: DataTypes.STRING(50),
    defaultValue: 'modern'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_public'
  }
}, {
  tableName: 'districts',
  timestamps: true,
  underscored: true
});

module.exports = District;
