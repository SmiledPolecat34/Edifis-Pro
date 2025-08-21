const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Task = sequelize.define("Task", {
  task_id: {
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
  status: {
    type: DataTypes.ENUM('En cours', 'Terminé', 'Annulé', 'Prévu'),
    allowNull: false,
  },
  creation_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  start_date: {
    type: DataTypes.DATE,
  },
  end_date: {
    type: DataTypes.DATE,
  },
  assignees: {
    type: DataTypes.JSON,
    allowNull: true, // Ou false si une tâche doit toujours avoir des assignés
    defaultValue: [], // Valeur par défaut : un tableau vide
  },
  construction_site_id: { type: DataTypes.INTEGER, allowNull: true }, // chantier associé

});

Task.associate = (models) => {
  // Une tâche appartient à un chantier
  Task.belongsTo(models.ConstructionSite, { foreignKey: "construction_site_id" });
  models.ConstructionSite.hasMany(Task, { foreignKey: "construction_site_id" });
};

module.exports = Task;
