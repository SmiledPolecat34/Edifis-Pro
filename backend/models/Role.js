const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Role = sequelize.define("roles", {
  role_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.ENUM("Admin", "Worker", "Manager"), 
    allowNull: false,
  },
});

module.exports = Role;