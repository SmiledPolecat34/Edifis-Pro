require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const Role = require('../models/Role');
const User = require('../models/User');
const Competence = require('../models/Competence');
const ConstructionSite = require('../models/ConstructionSite');
const Task = require('../models/Task');

async function run() {
    try {
        await sequelize.authenticate();

        await sequelize.sync({ alter: true });

        // ---- ROLES
        const [adminRole] = await Role.findOrCreate({
            where: { name: 'Admin' },
            defaults: { name: 'Admin' },
        });
        const [managerRole] = await Role.findOrCreate({
            where: { name: 'Manager' },
            defaults: { name: 'Manager' },
        });
        const [workerRole] = await Role.findOrCreate({
            where: { name: 'Worker' },
            defaults: { name: 'Worker' },
        });

        // ---- ADMIN USER (Admin)
        const adminEmail = 'admin@edifis-pro.com';
        const adminPwd = 'AdminEdifis2025!';
        const hash = await bcrypt.hash(adminPwd, 10);

        const [admin] = await User.findOrCreate({
            where: { email: adminEmail },
            defaults: {
                firstname: 'Admin',
                lastname: 'Edifis',
                email: adminEmail,
                numberphone: '0600000000',
                profile_picture: null,
                password: hash,
                role: 'Admin',
                role_id: adminRole.role_id,
            },
        });


        // ---- COMPÉTENCES
        const compNames = ['Maçonnerie', 'Électricité', 'Plomberie', 'Peinture'];
        const comps = [];
        for (const name of compNames) {
            const [c] = await Competence.findOrCreate({ where: { name }, defaults: { name } });
            comps.push(c);
        }

        // ---- CHANTIERS (construction_site)
        const [site1] = await ConstructionSite.findOrCreate({
            where: { name: 'Chantier A - Rénovation école' },
            defaults: {
                state: 'En cours',
                description: 'Rénovation du bâtiment principal et des sanitaires.',
                adresse: '12 Rue des Lilas, 75000 Paris',
                start_date: '2025-08-01',
                end_date: null,
                open_time: '08:00:00',
                end_time: '17:00:00',
                date_creation: new Date(),
                image_url: null,
                chef_de_projet_id: admin.user_id, // le manager
            },
        });

        const [site2] = await ConstructionSite.findOrCreate({
            where: { name: 'Chantier B - Extension gymnase' },
            defaults: {
                state: 'Prévu',
                description: 'Création d’une extension de 400m².',
                adresse: '5 Avenue du Stade, 69000 Lyon',
                start_date: '2025-09-15',
                end_date: null,
                open_time: '08:00:00',
                end_time: '17:00:00',
                date_creation: new Date(),
                image_url: null,
                chef_de_projet_id: admin.user_id,
            },
        });

        // ---- TÂCHES (Task)
        const [t1] = await Task.findOrCreate({
            where: { name: 'Démolition cloison' },
            defaults: {
                description: 'Retrait de la cloison existante au 1er étage.',
                status: 'En cours',
                creation_date: new Date(),
                start_date: new Date(),
                end_date: null,
                assignees: [],
                construction_site_id: site1.construction_site_id,
            },
        });

        const [t2] = await Task.findOrCreate({
            where: { name: 'Commande matériaux élec.' },
            defaults: {
                description: 'Câbles, disjoncteurs, goulottes.',
                status: 'Prévu',
                creation_date: new Date(),
                start_date: null,
                end_date: null,
                assignees: [],
                construction_site_id: site1.construction_site_id,
            },
        });

        const [t3] = await Task.findOrCreate({
            where: { name: 'Peinture vestiaires' },
            defaults: {
                description: 'Sous-couche + 2 couches finition.',
                status: 'Prévu',
                creation_date: new Date(),
                start_date: null,
                end_date: null,
                assignees: [],
                construction_site_id: site2.construction_site_id,
            },
        });

        console.log('✅ Seed terminé : rôles, admin, compétences, chantiers, tâches.');
        process.exit(0);
    } catch (e) {
        console.error('❌ Seed error:', e);
        process.exit(1);
    }
}

run();
