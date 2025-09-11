require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../config/sequelize');
const { User, Role } = require('../models');

(async () => {
  try {
    await sequelize.authenticate();

    const [adminRole] = await Role.findOrCreate({
      where: { name: 'Admin' },
      defaults: { name: 'Admin' },
    });
    const hash = await bcrypt.hash('AdminEdifis2025!', 10);

    const [user, created] = await User.findOrCreate({
      where: { email: 'admin@edifis-pro.com' },
      defaults: {
        firstname: 'Admin',
        lastname: 'Edifis',
        email: 'admin@edifis-pro.com',
        numberphone: '0600000000',
        profile_picture: null,
        password: hash,
        role_id: adminRole.role_id,
      },
    });

    if (!created) {
      await user.update({ password: hash, role_id: adminRole.role_id, updatedAt: new Date() });
    }

    console.log('✅ Admin ok : admin@edifis-pro.com / AdminEdifis2025!');
    process.exit(0);
  } catch (e) {
    console.error('❌ seed-admin error:', e);
    process.exit(1);
  }
})();
