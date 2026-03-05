const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InteractionNode = sequelize.define('InteractionNode', {
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
  position: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  requiredState: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'required_state',
    validate: {
      isIn: [['idle', 'walking', 'running', 'sitting', 'interacting', 'dancing']]
    }
  },
  isOccupied: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_occupied'
  },
  occupiedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'occupied_by'
  },
  occupiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'occupied_at'
  },
  maxOccupancy: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'max_occupancy'
  }
}, {
  tableName: 'interaction_nodes',
  timestamps: true,
  underscored: true
});

module.exports = InteractionNode;
