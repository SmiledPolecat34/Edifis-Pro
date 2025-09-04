const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserTask = sequelize.define(
  "UserTask",
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    tableName: "user_tasks",
    timestamps: false,
  }
);

module.exports = UserTask;
