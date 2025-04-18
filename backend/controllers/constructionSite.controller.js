const ConstructionSite = require("../models/ConstructionSite");
const User = require("../models/User");
const Task = require("../models/Task");
const fs = require("fs");
const path = require("path");



// Créer un chantier
exports.createConstructionSite = async (req, res) => {
    try {
        console.log("Données reçues :", req.body);
        const { name, state, description, adresse, start_date, end_date, open_time, end_time, chef_de_projet_id } = req.body;

        let chefDeProjet = null;
        if (chef_de_projet_id) {
            chefDeProjet = await User.findByPk(chef_de_projet_id);
            if (!chefDeProjet || chefDeProjet.role !== "Manager") {
                return res.status(400).json({ message: "L'utilisateur spécifié n'est pas un chef de projet valide" });
            }
        }

        // Vérifier si une image a été envoyée
        let image_url = null;
        if (req.file) {
            image_url = req.file.filename; // Nom du fichier stocké
        }

        const site = await ConstructionSite.create({
            name,
            state,
            description,
            adresse,
            start_date,
            end_date,
            open_time,
            end_time,
            chef_de_projet_id: chefDeProjet ? chef_de_projet_id : null,
            image_url
        });

        res.status(201).json(site);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllConstructionSites = async (req, res) => {
    try {
        const { role, userId } = req.user; // ✅ Correction userId

        if (!userId) {
            return res.status(400).json({ message: "ID utilisateur non défini dans le token" });
        }

        let whereCondition = {};
        let includeOptions = [
            {
                model: User,
                as: "chefDeProjet",
                attributes: ["user_id", "firstname", "lastname", "email"],
            }
        ];

        if (role === "Admin") {
            console.log("Admin - Voir tous les chantiers");
        }

        
        else if (role === "Manager") {
            whereCondition = { chef_de_projet_id: userId };
        }

        
        else if (role === "Worker") {
            console.log("Worker - Voir les chantiers où il a des tâches");

            includeOptions.push({
                model: Task,
                as: "Tasks", 
                attributes: [],
                required: true,
                include: [
                    {
                        model: User,
                        attributes: [], // Pas besoin d'afficher les users
                        through: { attributes: [] }, // Supprime la table pivot user_tasks
                        where: { user_id: userId } //  Filtrer sur le bon ID utilisateur
                    }
                ]
            });
        }

        // Récupération des chantiers avec le filtre dynamique
        const sites = await ConstructionSite.findAll({
            attributes: [
                "construction_site_id",
                "name",
                "state",
                "description",
                "adresse",
                "start_date",
                "end_date",
                "open_time",
                "end_time",
                "date_creation",
                "image_url",
                "chef_de_projet_id"
            ],
            where: whereCondition,
            include: includeOptions
        });

        res.json(sites);
    } catch (error) {
        console.error("Erreur lors de la récupération des chantiers :", error);
        res.status(500).json({ error: error.message });
    }
};



// Récupérer un chantier par ID
exports.getConstructionSiteById = async (req, res) => {
    try {
        const site = await ConstructionSite.findByPk(req.params.id, {
            attributes: [
                "construction_site_id",
                "name",
                "state",
                "description",
                "adresse",
                "start_date",
                "end_date",
                "open_time",
                "end_time",
                "date_creation",
                "image_url",
                "chef_de_projet_id" // Inclure l'ID du chef de projet
            ],
            include: [
                {
                    model: User,
                    as: "chefDeProjet", // Assurer l'alias correspondant à la relation définie dans Sequelize
                    attributes: ["user_id", "firstname", "lastname", "email"]
                }
            ]
        });
        if (!site) return res.status(404).json({ message: "Chantier non trouvé" });
        res.json(site);
    } catch (error) {
        console.error("Erreur lors de la récupération du chantier :", error);
        res.status(500).json({ error: error.message });
    }
};

// Mettre à jour un chantier
exports.updateConstructionSite = async (req, res) => {
    try {
        const site = await ConstructionSite.findByPk(req.params.id);
        if (!site) return res.status(404).json({ message: "Chantier non trouvé" });

        await site.update(req.body);
        res.json(site);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Supprimer un chantier
exports.deleteConstructionSite = async (req, res) => {
    try {
        const site = await ConstructionSite.findByPk(req.params.id);
        if (!site) return res.status(404).json({ message: "Chantier non trouvé" });

        await site.destroy();
        res.json({ message: "Chantier supprimé" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Assigner un chantier à un chef de chantier
exports.assignConstructionSite = async (req, res) => {
    try {
        const { siteId, chefId } = req.body;

        if (!siteId || !chefId) {
            return res.status(400).json({ message: "L'ID du chantier et du chef de chantier sont requis" });
        }

        const site = await ConstructionSite.findByPk(siteId);
        if (!site) return res.status(404).json({ message: "Chantier non trouvé" });

        const chef = await User.findByPk(chefId);
        if (!chef || chef.role_id !== 3) {
            return res.status(400).json({ message: "L'utilisateur spécifié n'est pas un chef de chantier" });
        }

        site.chef_id = chefId;
        await site.save();

        res.json({ message: "Chantier assigné avec succès", site });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Mettre à jour l’image du chantier
exports.updateConstructionImage = async (req, res) => {
    try {
        const { siteId } = req.body;
        if (!req.file) {
            return res.status(400).json({ message: "Aucune image envoyée" });
        }

        const site = await ConstructionSite.findByPk(siteId);
        if (!site) {
            return res.status(404).json({ message: "Chantier non trouvé" });
        }

        // Supprimer l'ancienne image si elle existe
        if (site.image_url) {
            const oldImagePath = path.join(__dirname, "../uploads/construction_sites", site.image_url);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        // Mettre à jour le chantier avec la nouvelle image
        site.image_url = req.file.filename;
        await site.save();

        res.json({ message: "Image du chantier mise à jour avec succès", image_url: site.image_url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};





exports.getConstructionSitesByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        // Vérifier si l'utilisateur existe
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Récupérer tous les chantiers liés aux tâches de l'utilisateur
        const sites = await ConstructionSite.findAll({
            attributes: [
                "construction_site_id", "name", "state", "description",
                "adresse", "start_date", "end_date", "open_time", "end_time", "date_creation", "image_url"
            ],
            include: [
                {
                    model: Task,
                    attributes: ["task_id", "name", "description", "status", "start_date", "end_date"],
                    include: [
                        {
                            model: User,
                            attributes: [], // Ne pas afficher les infos utilisateur
                            through: { attributes: [] }, // Supprime la table pivot user_tasks
                            where: { user_id: userId } // Filtrer les tâches de cet utilisateur
                        }
                    ]
                }
            ]
        });

        if (!sites.length) {
            return res.status(404).json({ message: "Aucun chantier trouvé pour cet utilisateur" });
        }

        res.json(sites);
    } catch (error) {
        console.error("Erreur lors de la récupération des chantiers de l'utilisateur :", error);
        res.status(500).json({ error: error.message });
    }
};

