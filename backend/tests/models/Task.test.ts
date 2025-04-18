// Moquer la configuration de la base de données pour utiliser SQLite en mémoire
jest.mock("../../config/database", () => {
    const { Sequelize } = require("sequelize");
    return new Sequelize("sqlite::memory:", { logging: false });
  });
  
  import Task from "../../models/Task";
  import sequelize from "../../config/database";
  
  describe("Task Model", () => {
    beforeAll(async () => {
      await sequelize.sync({ force: true });
    });
    
    afterAll(async () => {
      await sequelize.close();
    });
    
    it("devrait créer une tâche", async () => {
      const task = await Task.create({
        name: "Task Test",
        description: "Task description test",
        status: "En attente",
        start_date: "2023-01-01",
        end_date: "2023-01-02",
      });
      const taskJSON = task.toJSON();
      expect(taskJSON.task_id).toBeDefined();
      expect(taskJSON.name).toBe("Task Test");
      expect(taskJSON.description).toBe("Task description test");
      expect(taskJSON.status).toBe("En attente");
      // Convertir en Date, puis en chaîne ISO et comparer la partie date
      expect(new Date(taskJSON.start_date).toISOString().substring(0, 10)).toBe("2023-01-01");
      expect(new Date(taskJSON.end_date).toISOString().substring(0, 10)).toBe("2023-01-02");
      expect(taskJSON.creation_date).toBeDefined();
    });
  });
  