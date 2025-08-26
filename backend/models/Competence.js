const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Competence = sequelize.define('Competence', {
  competence_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'competences',
  timestamps: false
});

module.exports = Competence;
