const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT || "mysql",
  logging: false,
  port: parseInt(process.env.DB_PORT, 10) || 3306,
});

module.exports = sequelize;