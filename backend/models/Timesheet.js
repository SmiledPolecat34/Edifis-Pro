const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Timesheet = sequelize.define("timesheet", {
  timesheet_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true, 
  },
});

module.exports = Timesheet;
