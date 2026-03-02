const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'password_hash'
  },
  username: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  fullName: {
    type: DataTypes.STRING,
    field: 'full_name'
  },
  companyId: {
    type: DataTypes.INTEGER,
    field: 'company_id'
  },
  role: {
    type: DataTypes.STRING(50),
    defaultValue: 'user'
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  xp: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  avatarId: {
    type: DataTypes.INTEGER,
    field: 'avatar_id'
  },
  lastLogin: {
    type: DataTypes.DATE,
    field: 'last_login'
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.passwordHash) {
        user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('passwordHash')) {
        user.passwordHash = await bcrypt.hash(user.passwordHash, 10);
      }
    }
  }
});

User.prototype.validatePassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.passwordHash;
  return values;
};

module.exports = User;
