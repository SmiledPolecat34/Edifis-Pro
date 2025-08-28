const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
  user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  firstname: { type: DataTypes.STRING, allowNull: false },
  lastname: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  numberphone: { type: DataTypes.STRING(20), allowNull: false },
  profile_picture: { type: DataTypes.STRING, allowNull: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role_id: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: "users",
  underscored: true,
  timestamps: false,
});

module.exports = User;
