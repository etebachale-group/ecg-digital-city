const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InteractiveObject = sequelize.define('InteractiveObject', {
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
    field: 'object_type',
    validate: {
      isIn: [['chair', 'door', 'table', 'furniture']]
    }
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  modelPath: {
    type: DataTypes.STRING(500),
    field: 'model_path'
  },
  position: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: { x: 0, y: 0, z: 0 }
  },
  rotation: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: { x: 0, y: 0, z: 0 }
  },
  scale: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: { x: 1, y: 1, z: 1 }
  },
  state: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  config: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'created_by',
    defaultValue: 1
  }
}, {
  tableName: 'interactive_objects',
  timestamps: true,
  underscored: true
});

module.exports = InteractiveObject;
