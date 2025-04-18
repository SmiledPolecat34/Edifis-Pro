const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");
const User = require("./User");
const Task = require("./Task");
const Timesheet = require("./Timesheet");
const ConstructionSite = require("./ConstructionSite");
const Competence = require("./Competence");

// Associations

// Un utilisateur peut être assigné à plusieurs tâches
User.belongsToMany(Task, { through: "user_tasks", foreignKey: "user_id" });
Task.belongsToMany(User, { through: "user_tasks", foreignKey: "task_id" });

// Un chantier peut contenir plusieurs tâches
ConstructionSite.hasMany(Task, { foreignKey: "construction_site_id" });
Task.belongsTo(ConstructionSite, { foreignKey: "construction_site_id" });

// Un utilisateur peut avoir plusieurs feuilles de temps (timesheets)
User.hasMany(Timesheet, { foreignKey: "user_id" });
Timesheet.belongsTo(User, { foreignKey: "user_id" });

// Un chantier peut être associé à plusieurs feuilles de temps
ConstructionSite.hasMany(Timesheet, { foreignKey: "construction_site_id" });
Timesheet.belongsTo(ConstructionSite, { foreignKey: "construction_site_id" });

// Relation N-N entre `users` et `competences`
User.belongsToMany(Competence, { through: "user_competences", foreignKey: "user_id" });
Competence.belongsToMany(User, { through: "user_competences", foreignKey: "competence_id" });

// Un chantier a un chef de projet (clé étrangère `chef_de_projet_id` dans `ConstructionSite`)
User.hasMany(ConstructionSite, { foreignKey: "chef_de_projet_id", as: "managedSites" });
ConstructionSite.belongsTo(User, { foreignKey: "chef_de_projet_id", as: "chefDeProjet" });

module.exports = { sequelize, User, Task, Timesheet, ConstructionSite, Competence };
