const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserCompetence = sequelize.define(
  "UserCompetence",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    competence_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  },
  {
    tableName: "user_competences",
    timestamps: false,
  }
);

module.exports = UserCompetence;