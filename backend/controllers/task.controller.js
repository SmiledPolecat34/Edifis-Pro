const Task = require("../models/Task");
const User = require("../models/User");
const ConstructionSite = require("../models/ConstructionSite");

// CRUD identique à `users`
exports.createTask = async (req, res) => {
    try {
        const task = await Task.create(req.body);
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.findAll({
            include: [
                {
                    model: User,
                    through: { attributes: [] },
                    attributes: ["user_id", "firstname", "lastname", "email", "profile_picture"]
                },
                {
                    model: ConstructionSite,
                    attributes: ["construction_site_id", "name", "state", "open_time", "end_time"]
                }
            ]
        });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) return res.status(404).json({ message: "Tâche non trouvée" });
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// task by userid



exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) return res.status(404).json({ message: "Tâche non trouvée" });

        await task.update(req.body);
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) return res.status(404).json({ message: "Tâche non trouvée" });

        await task.destroy();
        res.json({ message: "Tâche supprimée" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



// Assigner plusieurs utilisateurs à une tâche
exports.assignUsersToTask = async (req, res) => {
    try {
        const { taskId, userIds } = req.body;
        console.log(req.body
        );

        if (!taskId || !userIds || userIds.length === 0) {
            return res.status(400).json({ message: "L'ID de la tâche et au moins un utilisateur sont requis" });
        }

        const task = await Task.findByPk(taskId);
        if (!task) return res.status(404).json({ message: "Tâche non trouvée" });

        const users = await User.findAll({ where: { user_id: userIds } });
        if (users.length !== userIds.length) {
            return res.status(400).json({ message: "Un ou plusieurs utilisateurs sont invalides" });
        }

        // ⚡ Ajoute les utilisateurs à la tâche via la table pivot `user_tasks`
        await task.addUsers(users);

        res.json({ message: "Tâche assignée avec succès", task });
    } catch (error) {
        console.error("Erreur lors de l'assignation des utilisateurs :", error);
        res.status(500).json({ error: error.message });
    }
};


exports.getTasksByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        const tasks = await Task.findAll({
            include: [
                {
                    model: User,
                    through: { attributes: [] },
                    where: { user_id: userId },
                    attributes: ["user_id", "firstname", "lastname", "email"]
                },
                {
                    model: ConstructionSite,
                    attributes: ["construction_site_id", "name", "state", "open_time", "end_time", 'start_date', 'end_date', 'image_url', 'chef_de_projet_id', 'adresse'],
                }
            ]
        });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

