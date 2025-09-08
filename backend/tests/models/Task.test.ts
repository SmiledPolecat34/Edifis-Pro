// Moquer la configuration de la base de données pour utiliser SQLite en mémoire
jest.mock('../../config/database', () => {
  const { Sequelize } = require('sequelize');
  return new Sequelize('sqlite::memory:', { logging: false });
});

import Task from '../../models/Task';
import sequelize from '../../config/database';

describe('Task Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('devrait créer une tâche', async () => {
    const task = await Task.create({
      name: 'Task Test',
      description: 'Task description test',
      status: 'Prévu',
      start_date: '2023-01-01',
      end_date: '2023-01-02',
    });
    const taskJSON = task.toJSON();
    expect(taskJSON.task_id).toBeDefined();
    expect(taskJSON.name).toBe('Task Test');
    expect(taskJSON.description).toBe('Task description test');
    expect(taskJSON.status).toBe('Prévu');
    // Convertir en Date, puis en chaîne ISO et comparer la partie date
    expect(new Date(taskJSON.start_date).toISOString().substring(0, 10)).toBe('2023-01-01');
    expect(new Date(taskJSON.end_date).toISOString().substring(0, 10)).toBe('2023-01-02');
    expect(taskJSON.creation_date).toBeDefined();
  });

  it("devrait utiliser 'Prévu' comme statut par défaut si non spécifié", async () => {
    const task = await Task.create({
      name: 'Task with default status',
    });
    expect(task.status).toBe('Prévu');
  });

  it('ne devrait pas créer une tâche avec un statut invalide', async () => {
    await expect(
      Task.create({
        name: 'Task with invalid status',
        status: 'InvalidStatus',
      }),
    ).rejects.toThrow();
  });

  it('récupération de toutes les tâches', async () => {
    const tasks = await Task.findAll();
    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.length).toBeGreaterThanOrEqual(2); // Au moins les deux tâches créées précédemment
  });

  it("mise à jour d'une tâche", async () => {
    const task = await Task.create({ name: 'Task to update' });
    task.name = 'Updated Task Name';
    await task.save();
    const updatedTask = await Task.findByPk(task.task_id);
    expect(updatedTask?.name).toBe('Updated Task Name');
  });

  it("suppression d'une tâche", async () => {
    const task = await Task.create({ name: 'Task to delete' });
    const taskId = task.task_id;
    await task.destroy();
    const deletedTask = await Task.findByPk(taskId);
    expect(deletedTask).toBeNull();
  });
});
