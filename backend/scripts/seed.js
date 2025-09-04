require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../config/sequelize');

const Role = require('../models/Role');
const User = require('../models/User');
const Competence = require('../models/Competence');
const ConstructionSite = require('../models/ConstructionSite');
const Task = require('../models/Task');

async function run() {
    try {
        await sequelize.authenticate();
        await sequelize.sync();

        // ---- ROLES
        const roleNames = ['Admin', 'Manager', 'Worker', 'HR', 'Project_Chief'];
        const roles = {};
        for (const name of roleNames) {
            const [role] = await Role.findOrCreate({ where: { name }, defaults: { name } });
            roles[name] = role;
        }

        // ---- USERS
        const users = [];
        const passwordHash = await bcrypt.hash('Password123!', 10);

        const firstNames = ["Alice", "Bob", "Charles", "Diane", "Eve", "Frank", "Grace", "Henry", "Ivy", "Jack", "Liam", "Olivia", "Noah", "Emma", "Lucas", "Ava", "Mason", "Sophia", "Ethan", "Isabella"];
        const lastNames = ["Dubois", "Martin", "Bernard", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Michel", "Garcia", "David", "Bertrand", "Roux", "Vincent", "Fournier", "Morel"];

        function getRandomName(arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        }

        // ---- ADMIN USER
        const [adminUser] = await User.findOrCreate({
            where: { email: 'admin@edifis-pro.com' },
            defaults: {
                firstname: 'Admin',
                lastname: 'EdifisPro',
                email: 'admin@edifis-pro.com',
                numberphone: '0600000000',
                password: await bcrypt.hash('AdminEdifis2025!', 10),
                role_id: roles['Admin'].role_id,
            },
        });
        users.push(adminUser);

        // ---- MANAGERS (3)
        for (let i = 0; i < 3; i++) {
            const firstname = getRandomName(firstNames);
            const lastname = getRandomName(lastNames);
            const email = `manager.${firstname.toLowerCase()}.${lastname.toLowerCase()}@edifis-pro.com`;
            const [user] = await User.findOrCreate({
                where: { email },
                defaults: {
                    firstname,
                    lastname,
                    email,
                    numberphone: `06010000${i.toString().padStart(2, '0')}`,
                    password: passwordHash,
                    role_id: roles['Manager'].role_id,
                },
            });
            users.push(user);
        }

        // ---- PROJECT CHIEFS (7)
        for (let i = 0; i < 7; i++) {
            const firstname = getRandomName(firstNames);
            const lastname = getRandomName(lastNames);
            const email = `pm.${firstname.toLowerCase()}.${lastname.toLowerCase()}@edifis-pro.com`;
            const [user] = await User.findOrCreate({
                where: { email },
                defaults: {
                    firstname,
                    lastname,
                    email,
                    numberphone: `06100000${i.toString().padStart(2, '0')}`,
                    password: passwordHash,
                    role_id: roles['Project_Chief'].role_id,
                },
            });
            users.push(user);
        }

        // ---- COMPÉTENCES
        const compNames = [
            'Maçonnerie', 'Électricité', 'Plomberie', 'Peinture', 'Plâtrier',
            'Charpentier', 'Grutier', 'Soudeur', 'Terrassier', 'Couvreur',
            'Menuisier', 'Climaticien', 'Paysagiste', 'Chef de chantier', 'Conducteur d\'engins'
        ];
        const competences = [];
        for (const name of compNames) {
            const [competence] = await Competence.findOrCreate({ where: { name } });
            competences.push(competence);
        }

        // ---- WORKERS (30)
        for (let i = 0; i < 30; i++) {
            const firstname = getRandomName(firstNames);
            const lastname = getRandomName(lastNames);
            const email = `worker.${firstname.toLowerCase()}.${lastname.toLowerCase()}@edifis-pro.com`;
            const assignedCompetence = competences[i % competences.length];
            const [user] = await User.findOrCreate({
                where: { email },
                defaults: {
                    firstname,
                    lastname,
                    email,
                    numberphone: `06200000${i.toString().padStart(2, '0')}`,
                    password: passwordHash,
                    role_id: roles['Worker'].role_id,
                    competence_id: assignedCompetence.competence_id,
                },
            });
            users.push(user);
        }

        // ---- CHANTIERS
        const projectManagers = users.filter(u => u.role_id === roles['Project_Chief'].role_id);

        const sitesData = [
            {
                name: 'Rénovation École Primaire',
                state: 'En cours',
                description: 'Rénovation complète du bâtiment principal et des sanitaires de l\'école.',
                adresse: '12 Rue des Lilas, 75000 Paris',
                start_date: '2025-08-01',
                end_date: '2026-03-15',
                chef_de_projet_id: projectManagers[0].user_id,
            },
            // ... (les autres sites identiques à ton script)
        ];

        const constructionSites = [];
        for (const siteData of sitesData) {
            const [site] = await ConstructionSite.findOrCreate({
                where: { name: siteData.name },
                defaults: { ...siteData, open_time: '08:00:00', end_time: '17:00:00' },
            });
            constructionSites.push(site);
        }

        // ---- TÂCHES
        const workers = users.filter(u => u.role_id === roles['Worker'].role_id);

        const getWorkerByCompetence = (compName) => {
            const competence = competences.find(c => c.name === compName);
            if (!competence) return null;
            return workers.find(w => w.competence_id === competence.competence_id);
        };

        const tasksData = [
            { name: 'Démolition cloison', description: 'Retrait de la cloison existante au 1er étage.', status: 'En cours', construction_site: constructionSites[0], competence: 'Maçonnerie' },
            { name: 'Installation électrique', description: 'Câblage complet des nouvelles salles de classe.', status: 'Prévu', construction_site: constructionSites[0], competence: 'Électricité' },
            // ... (les autres tâches comme ton script)
        ];

        for (const taskData of tasksData) {
            const assignedWorker = getWorkerByCompetence(taskData.competence);
            const assignees = assignedWorker ? [assignedWorker.user_id] : [];

            await Task.findOrCreate({
                where: { name: taskData.name, construction_site_id: taskData.construction_site.construction_site_id },
                defaults: {
                    description: taskData.description,
                    status: taskData.status,
                    start_date: new Date(),
                    construction_site_id: taskData.construction_site.construction_site_id,
                    assignees,
                },
            });
        }

        console.log('✅ Seed terminé : rôles, utilisateurs, compétences, chantiers et tâches créés.');
        process.exit(0);
    } catch (e) {
        console.error('❌ Seed error:', e);
        process.exit(1);
    }
}

run();
