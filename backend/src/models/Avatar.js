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
  }
}, {
  tableName: 'avatars',
  timestamps: true,
  underscored: true
});

module.exports = Avatar;
