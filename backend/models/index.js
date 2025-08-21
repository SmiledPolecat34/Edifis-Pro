const sequelize = require("../config/database");
const User = require("./User");
const Task = require("./Task");
const Timesheet = require("./Timesheet");
const ConstructionSite = require("./ConstructionSite");
const Competence = require("./Competence");
const Role = require("./Role");
const PasswordResetToken = require("./PasswordResetToken");

const models = { User, Task, Timesheet, ConstructionSite, Competence, Role, PasswordResetToken };

// --- Définition des associations ---

// User <-> Role (1-N)
User.belongsTo(Role, { foreignKey: 'role_id' });
Role.hasMany(User, { foreignKey: 'role_id' });

// User <-> Competence (1-N)
// Un utilisateur a une compétence principale, une compétence peut être assignée à plusieurs utilisateurs.
User.belongsTo(Competence, { foreignKey: 'competence_id' });
Competence.hasMany(User, { foreignKey: 'competence_id' });

// User <-> Timesheet (1-N)
User.hasMany(Timesheet, { foreignKey: 'user_id' });
Timesheet.belongsTo(User, { foreignKey: 'user_id' });

// User <-> PasswordResetToken (1-N)
User.hasMany(PasswordResetToken, { foreignKey: 'user_id' });
PasswordResetToken.belongsTo(User, { foreignKey: 'user_id' });

// ConstructionSite <-> Task (1-N)
ConstructionSite.hasMany(Task, { foreignKey: "construction_site_id" });
Task.belongsTo(ConstructionSite, { foreignKey: "construction_site_id" });

// ConstructionSite <-> Timesheet (1-N)
ConstructionSite.hasMany(Timesheet, { foreignKey: "construction_site_id" });
Timesheet.belongsTo(ConstructionSite, { foreignKey: "construction_site_id" });

// ConstructionSite <-> User (Chef de projet) (1-N)
ConstructionSite.belongsTo(User, { foreignKey: 'chef_de_projet_id', as: 'chefDeProjet' });
User.hasMany(ConstructionSite, { foreignKey: 'chef_de_projet_id', as: 'managedSites' });


// Note: Les relations N-N User/Task et User/Competence ont été supprimées.
// La relation User/Task est maintenant gérée via un champ JSON `assignees` dans le modèle Task.
// La relation User/Competence est maintenant une relation 1-N.

module.exports = { sequelize, ...models };
