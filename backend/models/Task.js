const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define(
  'Task',
  {
    task_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    status: {
      type: DataTypes.ENUM('En cours', 'Terminé', 'Annulé', 'Prévu'),
      allowNull: false,
      defaultValue: 'Prévu',
    },
    creation_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    start_date: { type: DataTypes.DATE, allowNull: true },
    end_date: { type: DataTypes.DATE, allowNull: true },
    assignees: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
    construction_site_id: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: 'Task',
    timestamps: false,
    underscored: true,
  }
);

Task.associate = (models) => {
  Task.belongsTo(models.ConstructionSite, {
    as: 'constructionSite',
    foreignKey: { name: 'construction_site_id', allowNull: true },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
};

module.exports = Task;
