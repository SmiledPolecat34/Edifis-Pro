const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Role = sequelize.define(
  'Role',
  {
    role_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
        type: DataTypes.ENUM('Admin', 'Worker', 'Manager', 'Project_Chief', 'HR'),
        allowNull: false,
        validate: {
          isIn: [['Admin', 'Worker', 'Manager', 'Project_Chief', 'HR']],
        },
      },  },
  {
    tableName: 'roles',
    timestamps: false,
  },
);

module.exports = Role;
