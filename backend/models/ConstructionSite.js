const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ConstructionSite = sequelize.define(
  'ConstructionSite',
  {
    construction_site_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    state: {
      type: DataTypes.ENUM('En cours', 'Terminé', 'Annulé', 'Prévu'),
      allowNull: false,
    },
    description: { type: DataTypes.TEXT },
    adresse: { type: DataTypes.STRING },
    start_date: { type: DataTypes.DATEONLY },
    end_date: { type: DataTypes.DATEONLY },
    open_time: { type: DataTypes.TIME },
    end_time: { type: DataTypes.TIME },
    date_creation: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    image_url: { type: DataTypes.STRING },
    chef_de_projet_id: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: 'construction_site',
    timestamps: false,
    underscored: true,
  }
);

ConstructionSite.associate = (models) => {
  // manager (user) optionnel
  ConstructionSite.belongsTo(models.User, {
    as: 'chefDeProjet',
    foreignKey: { name: 'chef_de_projet_id', allowNull: true },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  ConstructionSite.hasMany(models.Task, {
    as: 'tasks',
    foreignKey: { name: 'construction_site_id', allowNull: true },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
};

module.exports = ConstructionSite;
