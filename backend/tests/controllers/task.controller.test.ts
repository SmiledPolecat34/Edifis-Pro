import { Request, Response } from "express";
const Task = require("../../models/Task");
const taskController = require("../../controllers/task.controller");

describe("Task Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("createTask", () => {
    it("devrait créer une tâche et renvoyer un status 201", async () => {
      const newTask = { title: "Test Task", description: "Description de test" };
      req.body = newTask;
      Task.create = jest.fn().mockResolvedValue(newTask);

      await taskController.createTask(req as Request, res as Response);

      expect(Task.create).toHaveBeenCalledWith(newTask);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newTask);
    });

    it("devrait renvoyer une erreur 500 en cas d'échec lors de la création", async () => {
      const error = new Error("Creation error");
      Task.create = jest.fn().mockRejectedValue(error);
      req.body = {};

      await taskController.createTask(req as Request, res as Response);

      expect(Task.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("getAllTasks", () => {
    it("devrait renvoyer toutes les tâches", async () => {
      const tasks = [{ id: 1, title: "Task 1" }, { id: 2, title: "Task 2" }];
      Task.findAll = jest.fn().mockResolvedValue(tasks);

      await taskController.getAllTasks(req as Request, res as Response);

      expect(Task.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(tasks);
    });

    it("devrait renvoyer une erreur 500 en cas d'échec lors de la récupération", async () => {
      const error = new Error("Retrieval error");
      Task.findAll = jest.fn().mockRejectedValue(error);

      await taskController.getAllTasks(req as Request, res as Response);

      expect(Task.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("getTaskById", () => {
    it("devrait renvoyer la tâche si trouvée", async () => {
      const task = { id: 1, title: "Task 1" };
      req.params = { id: "1" };
      Task.findByPk = jest.fn().mockResolvedValue(task);

      await taskController.getTaskById(req as Request, res as Response);

      expect(Task.findByPk).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith(task);
    });

    it("devrait renvoyer un status 404 si la tâche n'est pas trouvée", async () => {
      req.params = { id: "1" };
      Task.findByPk = jest.fn().mockResolvedValue(null);

      await taskController.getTaskById(req as Request, res as Response);

      expect(Task.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Tâche non trouvée" });
    });

    it("devrait renvoyer une erreur 500 en cas d'échec lors de la récupération", async () => {
      const error = new Error("Retrieval error");
      req.params = { id: "1" };
      Task.findByPk = jest.fn().mockRejectedValue(error);

      await taskController.getTaskById(req as Request, res as Response);

      expect(Task.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("updateTask", () => {
    it("devrait mettre à jour la tâche si trouvée", async () => {
      const task = {
        id: 1,
        title: "Old Task",
        update: jest.fn().mockResolvedValue({ id: 1, title: "Updated Task" }),
      };
      req.params = { id: "1" };
      req.body = { title: "Updated Task" };
      Task.findByPk = jest.fn().mockResolvedValue(task);

      await taskController.updateTask(req as Request, res as Response);

      expect(Task.findByPk).toHaveBeenCalledWith("1");
      expect(task.update).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(task);
    });

    it("devrait renvoyer un status 404 si la tâche n'est pas trouvée pour mise à jour", async () => {
      req.params = { id: "1" };
      req.body = { title: "Updated Task" };
      Task.findByPk = jest.fn().mockResolvedValue(null);

      await taskController.updateTask(req as Request, res as Response);

      expect(Task.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Tâche non trouvée" });
    });

    it("devrait renvoyer une erreur 500 en cas d'échec lors de la mise à jour", async () => {
      const error = new Error("Update error");
      req.params = { id: "1" };
      req.body = { title: "Updated Task" };
      Task.findByPk = jest.fn().mockRejectedValue(error);

      await taskController.updateTask(req as Request, res as Response);

      expect(Task.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("deleteTask", () => {
    it("devrait supprimer la tâche si trouvée", async () => {
      const task = { id: 1, title: "Task 1", destroy: jest.fn().mockResolvedValue(undefined) };
      req.params = { id: "1" };
      Task.findByPk = jest.fn().mockResolvedValue(task);

      await taskController.deleteTask(req as Request, res as Response);

      expect(Task.findByPk).toHaveBeenCalledWith("1");
      expect(task.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: "Tâche supprimée" });
    });

    it("devrait renvoyer un status 404 si la tâche n'est pas trouvée pour suppression", async () => {
      req.params = { id: "1" };
      Task.findByPk = jest.fn().mockResolvedValue(null);

      await taskController.deleteTask(req as Request, res as Response);

      expect(Task.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Tâche non trouvée" });
    });

    it("devrait renvoyer une erreur 500 en cas d'échec lors de la suppression", async () => {
      const error = new Error("Deletion error");
      req.params = { id: "1" };
      Task.findByPk = jest.fn().mockRejectedValue(error);

      await taskController.deleteTask(req as Request, res as Response);

      expect(Task.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
});
