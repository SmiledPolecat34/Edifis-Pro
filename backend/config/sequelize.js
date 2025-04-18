const sequelize = require("./database");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });


require("../models/index");


const initDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(" Connexion à la base de données réussie !");


    await sequelize.sync({ alter: true });
    console.log("Synchronisation des modèles Sequelize réussie !");
  } catch (error) {
    console.error(" Erreur de connexion à la base de données :", error);
    process.exit(1);
  }
};

module.exports = initDB;
