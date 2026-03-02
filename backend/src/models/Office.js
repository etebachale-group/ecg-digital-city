const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Office = sequelize.define('Office', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'company_id'
  },
  districtId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'district_id'
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
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
    defaultValue: { width: 10, height: 3, depth: 10 }
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_public'
  },
  maxCapacity: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    field: 'max_capacity'
  },
  theme: {
    type: DataTypes.STRING(50),
    defaultValue: 'default'
  },
  primaryColor: {
    type: DataTypes.STRING(20),
    defaultValue: '#3498db',
    field: 'primary_color'
  },
  secondaryColor: {
    type: DataTypes.STRING(20),
    defaultValue: '#2c3e50',
    field: 'secondary_color'
  }
}, {
  tableName: 'offices',
  timestamps: true,
  underscored: true
});

module.exports = Office;
