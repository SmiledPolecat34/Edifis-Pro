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
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'competences',
  timestamps: true
});

module.exports = Competence;
