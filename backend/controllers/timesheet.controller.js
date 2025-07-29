const Timesheet = require("../models/Timesheet");

// Créer une feuille de temps
exports.createTimesheet = async (req, res) => {
    try {
        const timesheet = await Timesheet.create(req.body);
        res.status(201).json(timesheet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Récupérer toutes les feuilles de temps
exports.getAllTimesheets = async (req, res) => {
    try {
        const timesheets = await Timesheet.findAll();
        res.json(timesheets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Récupérer la feuille de temps active pour un utilisateur
exports.getActiveTimesheet = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const ts = await Timesheet.findOne({
            where: { user_id: userId, end_date: null },
        });
        if (!ts) {
            return res.json({ active: false });
        }
        return res.json({
            active: true,
            timesheet: {
                timesheet_id: ts.timesheet_id,
                user_id: ts.user_id,
                start_date: ts.start_date,
                end_date: ts.end_date,
            },
        });
    } catch (error) {
        console.error("getActiveTimesheet:", error);
        res.status(500).json({ message: error.message });
    }
};

// Récupérer une feuille de temps par ID
exports.getTimesheetById = async (req, res) => {
    try {
        const timesheet = await Timesheet.findByPk(req.params.id);
        if (!timesheet) {
            return res.status(404).json({ message: "Timesheet non trouvé" });
        }
        res.json(timesheet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mettre à jour une feuille de temps
exports.updateTimesheet = async (req, res) => {
    try {
        const timesheet = await Timesheet.findByPk(req.params.id);
        if (!timesheet) {
            return res.status(404).json({ message: "Timesheet non trouvé" });
        }
        await timesheet.update(req.body);
        res.json(timesheet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Supprimer une feuille de temps
exports.deleteTimesheet = async (req, res) => {
    try {
        const timesheet = await Timesheet.findByPk(req.params.id);
        if (!timesheet) {
            return res.status(404).json({ message: "Timesheet non trouvé" });
        }
        await timesheet.destroy();
        res.json({ message: "Timesheet supprimé" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Horodatage : pointage entrée
exports.clockIn = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "L'ID utilisateur est requis" });
        }
        const timesheet = await Timesheet.create({
            user_id: userId,
            start_date: new Date(),
        });
        res.json({ message: "Heure d'entrée enregistrée", timesheet });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Horodatage : pointage sortie
exports.clockOut = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "L'ID utilisateur est requis" });
        }
        const timesheet = await Timesheet.findOne({
            where: { user_id: userId, end_date: null },
        });
        if (!timesheet) {
            return res.status(400).json({
                message: "Aucune entrée trouvée pour cet utilisateur (déjà clock out ?)",
            });
        }
        timesheet.end_date = new Date();
        await timesheet.save();
        res.json({ message: "Heure de sortie enregistrée", timesheet });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
