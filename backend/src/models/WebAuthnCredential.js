const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WebAuthnCredential = sequelize.define('WebAuthnCredential', {
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
  credentialId: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
    field: 'credential_id'
  },
  publicKey: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'public_key'
  },
  counter: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'webauthn_credentials',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

WebAuthnCredential.associate = (models) => {
  WebAuthnCredential.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

module.exports = WebAuthnCredential;
