const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ConstructionSite = sequelize.define("construction_site", {
  construction_site_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.ENUM("En cours", "Terminé", "Annulé", "Prévu"),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  adresse: {
    type: DataTypes.STRING,
  },
  start_date: {
    type: DataTypes.DATEONLY,
  },
  end_date: {
    type: DataTypes.DATEONLY,
  },
  open_time: {
    type: DataTypes.TIME,
  },
  end_time: {
    type: DataTypes.TIME,
  },
  date_creation: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = ConstructionSite;
