const sequelize = require("../config/database");
const User = require("./User");
const Task = require("./Task");
const ConstructionSite = require("./ConstructionSite");
const Competence = require("./Competence");
const Role = require("./Role");
const PasswordResetToken = require("./PasswordResetToken");

const UserTask = require("./UserTask");
const UserCompetence = require("./UserCompetence");

const models = { User, Task, ConstructionSite, Competence, Role, PasswordResetToken, UserTask, UserCompetence };

// --- Définition des associations ---

// User <-> Role (1-N)
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });

// User <-> Competence (N-N)
User.belongsToMany(Competence, { through: UserCompetence, as: 'competences', foreignKey: 'user_id', otherKey: 'competence_id' });
Competence.belongsToMany(User, { through: UserCompetence, as: 'users', foreignKey: 'competence_id', otherKey: 'user_id' });

// User <-> PasswordResetToken (1-N)
User.hasMany(PasswordResetToken, { foreignKey: 'user_id' });
PasswordResetToken.belongsTo(User, { foreignKey: 'user_id' });

// ConstructionSite <-> Task (1-N)
ConstructionSite.hasMany(Task, { foreignKey: "construction_site_id" });
Task.belongsTo(ConstructionSite, { foreignKey: "construction_site_id", as: 'construction_site' });

// ConstructionSite <-> User (Chef de projet) (1-N)
ConstructionSite.belongsTo(User, { foreignKey: 'chef_de_projet_id', as: 'chefDeProjet' });
User.hasMany(ConstructionSite, { foreignKey: 'chef_de_projet_id', as: 'managedSites' });

// User <-> Task (N-N)
User.belongsToMany(Task, { through: UserTask, foreignKey: 'user_id', as: 'tasks' });
Task.belongsToMany(User, { through: UserTask, foreignKey: 'task_id', as: 'users' });

// User <-> Task (Creator) (1-N)
User.hasMany(Task, { foreignKey: 'creator_id', as: 'createdTasks' });
Task.belongsTo(User, { foreignKey: 'creator_id', as: 'creator' });


module.exports = { sequelize, ...models };
