const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Competence = sequelize.define("competences", {
  competence_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
});

module.exports = Competence;
