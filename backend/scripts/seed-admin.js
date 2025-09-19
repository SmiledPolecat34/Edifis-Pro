require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Role } = require('../models');

(async () => {
  try {
    await sequelize.authenticate();

    // Crée le rôle Admin s’il n’existe pas
    const [adminRole] = await Role.findOrCreate({
      where: { name: 'Admin' },
      defaults: { name: 'Admin' },
    });

    // Hash du mot de passe
    const hash = await bcrypt.hash('AdminEdifis2025!', 10);

    // Crée ou met à jour l’admin
    const [user, created] = await User.findOrCreate({
      where: { email: 'admin@edifis-pro.com' },
      defaults: {
        firstname: 'Admin',
        lastname: 'Edifis',
        email: 'admin@edifis-pro.com',
        numberphone: '0600000000',
        password: hash,
        role_id: adminRole.role_id,
      },
    });

    if (!created) {
      await user.update({ password: hash, role_id: adminRole.role_id });
    }

    console.log('✅ Admin créé/mis à jour : admin@edifis-pro.com / AdminEdifis2025!');
    process.exit(0);
  } catch (e) {
    console.error('❌ seed-admin error:', e);
    process.exit(1);
  }
})();
