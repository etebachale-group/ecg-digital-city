const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT
  },
  logo: {
    type: DataTypes.STRING(500)
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'owner_id'
  },
  subscriptionTier: {
    type: DataTypes.ENUM('basic', 'pro', 'enterprise'),
    defaultValue: 'basic',
    field: 'subscription_tier'
  },
  maxOffices: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'max_offices'
  },
  maxEmployees: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    field: 'max_employees'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'companies',
  timestamps: true,
  underscored: true
});

module.exports = Company;
