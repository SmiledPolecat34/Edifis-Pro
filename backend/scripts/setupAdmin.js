const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { Sequelize, DataTypes } = require('sequelize');

// On initialise une connexion Sequelize propre pour ce script
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT || 'mysql',
  logging: console.log, // Activer les logs pour le debug
  dialectOptions: {
    authPlugins: {
      mysql_native_password: () => require('mysql2/lib/auth_plugins/mysql_native_password'),
    },
  },
});

// On doit redéfinir les modèles dont on a besoin ici, car on ne peut pas les importer à cause d'un problème de dépendance circulaire dans le projet.
const Role = sequelize.define('Role', {
  role_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
}, { tableName: 'roles', timestamps: false });

const User = sequelize.define('User', {
  user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  firstname: { type: DataTypes.STRING, allowNull: false },
  lastname: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  numberphone: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role_id: { type: DataTypes.INTEGER },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'users', timestamps: true });

// Le service de mot de passe est simple, on peut le réécrire ici.
const bcrypt = require('bcrypt');
const hashPassword = async (password) => {
    return bcrypt.hash(password, 10);
};

const setupAdmin = async () => {
  try {
    console.log('Début du script de configuration de l\'administrateur (version autonome)...');
    await sequelize.authenticate();
    console.log('Connexion à la base de données réussie.');

    const [adminRole] = await Role.findOrCreate({
      where: { name: 'Admin' },
    });
    console.log(`Rôle 'Admin' assuré avec l\'ID: ${adminRole.role_id}`);

    const adminEmail = 'admin@edifis-pro.com';
    const existingUser = await User.findOne({ where: { email: adminEmail } });

    if (existingUser) {
      await existingUser.update({ role_id: adminRole.role_id });
      console.log(`L\'utilisateur existant ${adminEmail} a été mis à jour avec le rôle 'Admin'.`);
    } else {
      const defaultPassword = process.env.DEFAULT_PASSWORD || 'edifispr@2025';
      const hashedPassword = await hashPassword(defaultPassword);
      
      await User.create({
        firstname: 'Admin',
        lastname: 'EdifisPro',
        email: adminEmail,
        numberphone: '0000000000',
        password: hashedPassword,
        role_id: adminRole.role_id
      });
      console.log(`Nouvel utilisateur admin créé pour ${adminEmail}.`);
    }

    console.log('Configuration de l\'administrateur terminée avec succès.');

  } catch (error) {
    console.error('Erreur lors de la configuration de l\'administrateur:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('Connexion à la base de données fermée.');
  }
};

setupAdmin();