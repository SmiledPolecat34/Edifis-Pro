const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Setting = sequelize.define(
  'Setting',
  {
    key: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'settings',
    timestamps: false,
  },
);

module.exports = Setting;
