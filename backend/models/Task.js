const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

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
      validate: {
        isIn: [['En cours', 'Terminé', 'Annulé', 'Prévu']],
      },
    },
    creation_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    start_date: { type: DataTypes.DATE, allowNull: true },
    end_date: { type: DataTypes.DATE, allowNull: true },
    construction_site_id: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: 'tasks',
    timestamps: false,
    underscored: true,
    validate: {
      startDateBeforeEndDate() {
        if (
          this.start_date &&
          this.end_date &&
          new Date(this.start_date) > new Date(this.end_date)
        ) {
          throw new Error('Date de début doit être antérieure à la date de fin');
        }
      },
      endDateAfterStartDate() {
        if (
          this.end_date &&
          this.start_date &&
          new Date(this.end_date) < new Date(this.start_date)
        ) {
          throw new Error('Date de fin doit être postérieure à la date de début');
        }
      },
    },
  },
);

Task.associate = models => {
  Task.belongsTo(models.ConstructionSite, {
    as: 'constructionSite',
    foreignKey: { name: 'construction_site_id', allowNull: true },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
};

module.exports = Task;
