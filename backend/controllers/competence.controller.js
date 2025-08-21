const Competence = require("../models/Competence");
const { Op } = require('sequelize');

// Créer une compétence
exports.createCompetence = async (req, res) => {
    try {
        const competence = await Competence.create(req.body);
        res.status(201).json(competence);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Récupérer toutes les compétences avec pagination, recherche et filtres
exports.getAllCompetences = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, category, level } = req.query;
        const offset = (page - 1) * limit;

        // Construction des filtres
        const whereClause = { isDeleted: false };

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        if (category) {
            whereClause.category = category;
        }

        if (level) {
            whereClause.level = level;
        }

        const { count, rows: competences } = await Competence.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            competences,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Récupérer une compétence par ID
exports.getCompetenceById = async (req, res) => {
    try {
        const competence = await Competence.findOne({
            where: {
                id: req.params.id,
                isDeleted: false
            }
        });

        if (!competence) {
            return res.status(404).json({ message: "Compétence non trouvée" });
        }

        res.json(competence);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mettre à jour une compétence
exports.updateCompetence = async (req, res) => {
    try {
        const competence = await Competence.findOne({
            where: {
                id: req.params.id,
                isDeleted: false
            }
        });

        if (!competence) {
            return res.status(404).json({ message: "Compétence non trouvée" });
        }

        await competence.update(req.body);
        res.json(competence);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Soft delete une compétence
exports.deleteCompetence = async (req, res) => {
    try {
        const competence = await Competence.findOne({
            where: {
                id: req.params.id,
                isDeleted: false
            }
        });

        if (!competence) {
            return res.status(404).json({ message: "Compétence non trouvée" });
        }

        await competence.update({
            isDeleted: true,
            deletedAt: new Date()
        });

        res.json({ message: "Compétence supprimée (soft delete)" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Récupérer les catégories uniques
exports.getCategories = async (req, res) => {
    try {
        const categories = await Competence.findAll({
            attributes: ['category'],
            where: { isDeleted: false },
            group: ['category'],
            order: [['category', 'ASC']]
        });

        const uniqueCategories = categories
            .map(c => c.category)
            .filter(c => c !== null && c !== '');

        res.json(uniqueCategories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Récupérer les niveaux disponibles
exports.getLevels = async (req, res) => {
    try {
        res.json(['Beginner', 'Intermediate', 'Advanced', 'Expert']);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
