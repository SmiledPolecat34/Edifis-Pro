const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserTask = sequelize.define("user_tasks", {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'users',
      key: 'user_id',
    },
  },
  task_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'tasks',
      key: 'task_id',
    },
  },
});

module.exports = UserTask;
