const Task = require('../models/Task');
const User = require('../models/User');
const ConstructionSite = require('../models/ConstructionSite');
const Role = require('../models/Role');

// CRUD identique à `users`
exports.createTask = async (req, res) => {
  try {
    const { construction_site, ...restOfBody } = req.body;
    const taskData = { ...restOfBody, creator_id: req.user.id };

    if (construction_site && construction_site.construction_site_id) {
      taskData.construction_site_id = construction_site.construction_site_id;
    }

    const task = await Task.create(taskData);

    const fullTask = await Task.findByPk(task.task_id, {
      include: [
        {
          model: ConstructionSite,
          as: 'construction_site',
        },
        {
          model: User,
          as: 'users',
          attributes: ['user_id', 'firstname', 'lastname', 'email', 'profile_picture'],
          through: { attributes: [] },
        },
        {
          model: User,
          as: 'creator',
          attributes: ['user_id', 'firstname', 'lastname', 'email', 'profile_picture'],
        },
      ],
    });

    res.status(201).json(fullTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [
        {
          model: ConstructionSite,
          as: 'construction_site',
          attributes: ['construction_site_id', 'name', 'state', 'open_time', 'end_time'],
        },
        {
          model: User,
          as: 'users',
          attributes: ['user_id', 'firstname', 'lastname', 'email', 'profile_picture'],
          through: { attributes: [] },
          include: [
            {
              model: Role,
              as: 'role',
              attributes: ['role_id', 'name'],
            },
          ],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['user_id', 'firstname', 'lastname', 'email', 'profile_picture'],
          include: [
            {
              model: Role,
              as: 'role',
              attributes: ['role_id', 'name'],
            },
          ],
        },
      ],
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        {
          model: ConstructionSite,
          as: 'construction_site',
        },
        {
          model: User,
          as: 'users',
          attributes: ['user_id', 'firstname', 'lastname', 'email', 'profile_picture'],
          through: { attributes: [] },
          include: [
            {
              model: Role,
              as: 'role',
              attributes: ['role_id', 'name'],
            },
          ],
        },
        {
          model: User,
          as: 'creator',
          attributes: ['user_id', 'firstname', 'lastname', 'email', 'profile_picture'],
          include: [
            {
              model: Role,
              as: 'role',
              attributes: ['role_id', 'name'],
            },
          ],
        },
      ],
    });
    if (!task) return res.status(404).json({ message: 'Tâche non trouvée' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// task by userid
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds, construction_site_id, ...taskData } = req.body;

    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ message: 'Tâche non trouvée' });

    await task.update({ ...taskData, construction_site_id });

    if (userIds && Array.isArray(userIds)) {
      await task.setUsers(userIds);
    }

    const updatedTask = await Task.findByPk(id, {
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['user_id', 'firstname', 'lastname', 'email', 'profile_picture'],
          through: { attributes: [] },
        },
        {
          model: ConstructionSite,
          as: 'construction_site',
        },
      ],
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Tâche non trouvée' });

    await task.destroy();
    res.json({ message: 'Tâche supprimée' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Assigner plusieurs utilisateurs à une tâche
exports.assignUsersToTask = async (req, res) => {
  try {
    const { taskId, userIds } = req.body;
    const assigner = req.user;

    if (!taskId || !userIds || userIds.length === 0) {
      return res
        .status(400)
        .json({ message: "L\'ID de la tâche et au moins un utilisateur sont requis" });
    }

    const task = await Task.findByPk(taskId);
    if (!task) return res.status(404).json({ message: 'Tâche non trouvée' });

    const users = await User.findAll({
      where: { user_id: userIds },
      include: [{ model: Role, as: 'role' }],
    });
    if (users.length !== userIds.length) {
      return res.status(400).json({ message: 'Un ou plusieurs utilisateurs sont invalides' });
    }

    const roleHierarchy = {
      Admin: 3,
      Manager: 2,
      Worker: 1,
    };

    const assignerRoleLevel = roleHierarchy[assigner.role];

    for (const user of users) {
      const assigneeRoleLevel = roleHierarchy[user.role.name];
      if (assignerRoleLevel <= assigneeRoleLevel) {
        return res.status(403).json({
          message: `Vous ne pouvez pas assigner une tâche à un utilisateur de rang égal ou supérieur (utilisateur: ${user.firstname} ${user.lastname}, rôle: ${user.role.name}).`,
        });
      }
    }

    // ⚡ Ajoute les utilisateurs à la tâche via la table pivot `user_tasks`
    await task.addUsers(users);

    res.json({ message: 'Tâche assignée avec succès', task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getTasksByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const tasks = await user.getTasks({
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['user_id', 'firstname', 'lastname', 'email', 'profile_picture'],
          through: { attributes: [] },
        },
        {
          model: ConstructionSite,
          as: 'construction_site',
        },
        {
          model: User,
          as: 'creator',
          attributes: ['user_id', 'firstname', 'lastname', 'email', 'profile_picture'],
          include: [
            {
              model: Role,
              as: 'role',
              attributes: ['role_id', 'name'],
            },
          ],
        },
      ],
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getTasksByConstructionSite = async (req, res) => {
  try {
    const { siteId } = req.params;
    const tasks = await Task.findAll({
      where: { construction_site_id: siteId },
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['user_id', 'firstname', 'lastname', 'email', 'profile_picture'],
          through: { attributes: [] },
        },
      ],
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
