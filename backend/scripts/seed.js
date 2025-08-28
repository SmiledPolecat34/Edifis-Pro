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

        // Truncate all tables
        // await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        // await sequelize.truncate({ cascade: true, restartIdentity: true });
        // await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        await sequelize.sync({ alter: true });

        // ---- ROLES
        const [adminRole] = await Role.findOrCreate({ where: { name: 'Admin' } });
        const [managerRole] = await Role.findOrCreate({ where: { name: 'Manager' } });
        const [projectManagerRole] = await Role.findOrCreate({ where: { name: 'Project_Manager' } });
        const [workerRole] = await Role.findOrCreate({ where: { name: 'Worker' } });

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
                role_id: adminRole.role_id,
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
                    role_id: managerRole.role_id,
                },
            });
            users.push(user);
        }

        // ---- PROJECT MANAGERS (7)
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
                    role_id: projectManagerRole.role_id,
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
            const assignedCompetence = competences[i % competences.length]; // Assign competences cyclically
            const [user] = await User.findOrCreate({
                where: { email },
                defaults: {
                    firstname,
                    lastname,
                    email,
                    numberphone: `06200000${i.toString().padStart(2, '0')}`,
                    password: passwordHash,
                    role_id: workerRole.role_id,
                    competence_id: assignedCompetence.competence_id,
                },
            });
            users.push(user);
        }


        // ---- CHANTIERS
        const projectManagers = users.filter(u => u.role_id === projectManagerRole.role_id);

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
            {
                name: 'Extension Gymnase Municipal',
                state: 'Prévu',
                description: 'Création d’une extension de 400m² pour le gymnase, incluant vestiaires et douches.',
                adresse: '5 Avenue du Stade, 69000 Lyon',
                start_date: '2025-09-15',
                end_date: '2026-06-30',
                chef_de_projet_id: projectManagers[1].user_id,
            },
            {
                name: 'Construction Immeuble Résidentiel',
                state: 'Prévu',
                description: 'Construction d’un immeuble de 10 étages avec 40 appartements et parking souterrain.',
                adresse: '1 Place de la Bourse, 33000 Bordeaux',
                start_date: '2025-10-01',
                end_date: '2027-12-31',
                chef_de_projet_id: projectManagers[2].user_id,
            },
            {
                name: 'Aménagement Parc Urbain',
                state: 'En cours',
                description: 'Création d\'un nouveau parc avec aires de jeux, espaces verts et fontaines.',
                adresse: '25 Boulevard de la Liberté, 13000 Marseille',
                start_date: '2025-07-20',
                end_date: '2026-02-28',
                chef_de_projet_id: projectManagers[3].user_id,
            },
            {
                name: 'Construction Centre Commercial',
                state: 'En cours',
                description: 'Édification d\'un grand centre commercial avec plusieurs enseignes et restaurants.',
                adresse: '100 Avenue des Champs, 59000 Lille',
                start_date: '2025-06-01',
                end_date: '2027-01-31',
                chef_de_projet_id: projectManagers[4].user_id,
            },
            {
                name: 'Rénovation Hôpital Central',
                state: 'En cours',
                description: 'Modernisation de plusieurs ailes de l\'hôpital, incluant les blocs opératoires.',
                adresse: '3 Rue de l\'Hôpital, 67000 Strasbourg',
                start_date: '2025-09-01',
                end_date: '2026-11-30',
                chef_de_projet_id: projectManagers[0].user_id,
            },
            {
                name: 'Construction Pont Routier',
                state: 'Prévu',
                description: 'Construction d\'un nouveau pont pour désengorger le trafic en centre-ville.',
                adresse: 'Pont Neuf, 31000 Toulouse',
                start_date: '2026-01-10',
                end_date: '2027-08-20',
                chef_de_projet_id: projectManagers[1].user_id,
            },
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
        const workers = users.filter(u => u.role_id === workerRole.role_id);

        const getWorkerByCompetence = (compName) => {
            const competence = competences.find(c => c.name === compName);
            if (!competence) return null;
            return workers.find(w => w.competence_id === competence.competence_id);
        };

        const tasksData = [
            {
                name: 'Démolition cloison',
                description: 'Retrait de la cloison existante au 1er étage.',
                status: 'En cours',
                construction_site: constructionSites[0],
                competence: 'Maçonnerie',
            },
            {
                name: 'Installation électrique',
                description: 'Câblage complet des nouvelles salles de classe.',
                status: 'Prévu',
                construction_site: constructionSites[0],
                competence: 'Électricité',
            },
            {
                name: 'Peinture vestiaires',
                description: 'Application de sous-couche et deux couches de finition.',
                status: 'Prévu',
                construction_site: constructionSites[1],
                competence: 'Peinture',
            },
            {
                name: 'Installation plomberie',
                description: 'Mise en place des réseaux d\'eau et évacuations pour les 10 étages.',
                status: 'Prévu',
                construction_site: constructionSites[2],
                competence: 'Plomberie',
            },
            {
                name: 'Terrassement fondations',
                description: 'Préparation du terrain pour les fondations du nouveau bâtiment.',
                status: 'En cours',
                construction_site: constructionSites[3],
                competence: 'Terrassier',
            },
            {
                name: 'Pose charpente',
                description: 'Assemblage et pose de la charpente métallique du centre commercial.',
                status: 'En cours',
                construction_site: constructionSites[4],
                competence: 'Charpentier',
            },
            {
                name: 'Installation climatisation',
                description: 'Mise en place des systèmes de climatisation dans les bureaux.',
                status: 'Prévu',
                construction_site: constructionSites[5],
                competence: 'Climaticien',
            },
            {
                name: 'Soudure structure métallique',
                description: 'Soudure des éléments de la structure du pont.',
                status: 'Prévu',
                construction_site: constructionSites[6],
                competence: 'Soudeur',
            },
            {
                name: 'Aménagement paysager',
                description: 'Plantation d\'arbres et arbustes, création de massifs.',
                status: 'En cours',
                construction_site: constructionSites[3],
                competence: 'Paysagiste',
            },
            {
                name: 'Pose de carrelage',
                description: 'Pose du carrelage dans les couloirs et salles de bain.',
                status: 'En cours',
                construction_site: constructionSites[0],
                competence: 'Maçonnerie',
            },
            {
                name: 'Installation de faux-plafonds',
                description: 'Mise en place des faux-plafonds dans les bureaux.',
                status: 'Prévu',
                construction_site: constructionSites[5],
                competence: 'Plâtrier',
            },
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
                    assignees: assignees,
                },
            });
        }


        console.log('✅ Seed terminé : rôles, utilisateurs, compétences, chantiers et tâches créés avec des données réalistes.');
        process.exit(0);
    } catch (e) {
        console.error('❌ Seed error:', e);
        process.exit(1);
    }
}

run();