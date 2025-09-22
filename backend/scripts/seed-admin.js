require('dotenv').config();
const sequelize = require('../config/sequelize');
const { User, Role } = require('../models');
const { hash } = require('../services/password.service');

(async () => {
  try {
    await sequelize.authenticate();

    const [adminRole] = await Role.findOrCreate({
      where: { name: 'Admin' },
      defaults: { name: 'Admin' },
    });

    const hashedPassword = await hash('AdminEdifis2025!');

    const [user, created] = await User.findOrCreate({
      where: { email: 'admin@edifis-pro.com' },
      defaults: {
        firstname: 'Admin',
        lastname: 'Edifis',
        email: 'admin@edifis-pro.com',
        numberphone: '0600000000',
        profile_picture: null,
        password: hashedPassword,
        role_id: adminRole.role_id,
      },
    });

    if (!created) {
      await user.update({
        password: hashedPassword,
        role_id: adminRole.role_id,
        updatedAt: new Date(),
      });
    }

    console.log('Admin créé/mis à jour : admin@edifis-pro.com / AdminEdifis2025!');
    process.exit(0);
  } catch (e) {
    console.error('seed-admin error:', e);
    process.exit(1);
  }
})();
