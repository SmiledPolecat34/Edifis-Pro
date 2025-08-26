const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("users", {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  numberphone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    // unique: true, // Contrainte déjà présente dans le schéma SQL
  },
  profile_picture: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role_label: {
    type: DataTypes.ENUM("Admin", "Worker", "Manager"),
    allowNull: false,
    defaultValue: "Worker",
    field: "role",
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  // Clé étrangère pour la compétence principale de l'utilisateur
  competence_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'competences', // Nom de la table des compétences
      key: 'competence_id',
    },
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
});

module.exports = User;
