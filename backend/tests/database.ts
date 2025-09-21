import { Sequelize } from 'sequelize';
const sequelize: Sequelize = require('../config/database');

export const initDatabase = async () => {
  await sequelize.sync({ force: true });
};

export const closeDatabase = async () => {
  await sequelize.close();
};

export default sequelize;