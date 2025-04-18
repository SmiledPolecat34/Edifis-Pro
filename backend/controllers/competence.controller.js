const Competence = require("../models/Competence");

// Créer une compétence
exports.createCompetence = async (req, res) => {
    try {
        const competence = await Competence.create(req.body);
        res.status(201).json(competence);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Récupérer toutes les compétences
exports.getAllCompetences = async (req, res) => {
    try {
        const competences = await Competence.findAll();
        res.json(competences);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Récupérer une compétence par ID
exports.getCompetenceById = async (req, res) => {
    try {
        const competence = await Competence.findByPk(req.params.id);
        if (!competence) return res.status(404).json({ message: "Compétence non trouvée" });
        res.json(competence);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mettre à jour une compétence
exports.updateCompetence = async (req, res) => {
    try {
        const competence = await Competence.findByPk(req.params.id);
        if (!competence) return res.status(404).json({ message: "Compétence non trouvée" });

        await competence.update(req.body);
        res.json(competence);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Supprimer une compétence
exports.deleteCompetence = async (req, res) => {
    try {
        const competence = await Competence.findByPk(req.params.id);
        if (!competence) return res.status(404).json({ message: "Compétence non trouvée" });

        await competence.destroy();
        res.json({ message: "Compétence supprimée" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
