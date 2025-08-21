const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Competence = sequelize.define('Competence', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      len: [2, 50]
    }
  },
  level: {
    type: DataTypes.ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert'),
    allowNull: true,
    defaultValue: 'Beginner'
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'competences',
  timestamps: true,
  paranoid: true,
  deletedAt: 'deletedAt'
});

module.exports = Competence;
