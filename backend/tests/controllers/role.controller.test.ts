import { Request, Response } from "express";
const Role = require("../../models/Role");
const roleController = require("../../controllers/role.controller");

describe("Role Controller", () => {
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

  describe("createRole", () => {
    it("devrait créer un rôle et renvoyer un status 201", async () => {
      const newRole = { name: "Test Role" };
      req.body = newRole;
      Role.create = jest.fn().mockResolvedValue(newRole);

      await roleController.createRole(req as Request, res as Response);

      expect(Role.create).toHaveBeenCalledWith(newRole);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newRole);
    });

    it("devrait renvoyer une erreur 500 en cas d'échec lors de la création", async () => {
      const error = new Error("Creation error");
      Role.create = jest.fn().mockRejectedValue(error);
      req.body = {};

      await roleController.createRole(req as Request, res as Response);

      expect(Role.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("getAllRoles", () => {
    it("devrait renvoyer tous les rôles", async () => {
      const roles = [{ id: 1, name: "Role 1" }, { id: 2, name: "Role 2" }];
      Role.findAll = jest.fn().mockResolvedValue(roles);

      await roleController.getAllRoles(req as Request, res as Response);

      expect(Role.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(roles);
    });

    it("devrait renvoyer une erreur 500 en cas d'échec lors de la récupération", async () => {
      const error = new Error("Retrieval error");
      Role.findAll = jest.fn().mockRejectedValue(error);

      await roleController.getAllRoles(req as Request, res as Response);

      expect(Role.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("getRoleById", () => {
    it("devrait renvoyer le rôle si trouvé", async () => {
      const role = { id: 1, name: "Role 1" };
      req.params = { id: "1" };
      Role.findByPk = jest.fn().mockResolvedValue(role);

      await roleController.getRoleById(req as Request, res as Response);

      expect(Role.findByPk).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith(role);
    });

    it("devrait renvoyer un status 404 si le rôle n'est pas trouvé", async () => {
      req.params = { id: "1" };
      Role.findByPk = jest.fn().mockResolvedValue(null);

      await roleController.getRoleById(req as Request, res as Response);

      expect(Role.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Rôle non trouvé" });
    });

    it("devrait renvoyer une erreur 500 en cas d'erreur lors de la récupération", async () => {
      const error = new Error("Find error");
      req.params = { id: "1" };
      Role.findByPk = jest.fn().mockRejectedValue(error);

      await roleController.getRoleById(req as Request, res as Response);

      expect(Role.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("updateRole", () => {
    it("devrait mettre à jour le rôle si trouvé", async () => {
      const role = {
        id: 1,
        name: "Ancien Role",
        update: jest.fn().mockResolvedValue({ id: 1, name: "Updated Role" }),
      };
      req.params = { id: "1" };
      req.body = { name: "Updated Role" };
      Role.findByPk = jest.fn().mockResolvedValue(role);

      await roleController.updateRole(req as Request, res as Response);

      expect(Role.findByPk).toHaveBeenCalledWith("1");
      expect(role.update).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(role);
    });

    it("devrait renvoyer un status 404 si le rôle n'est pas trouvé pour mise à jour", async () => {
      req.params = { id: "1" };
      req.body = { name: "Updated Role" };
      Role.findByPk = jest.fn().mockResolvedValue(null);

      await roleController.updateRole(req as Request, res as Response);

      expect(Role.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Rôle non trouvé" });
    });

    it("devrait renvoyer une erreur 500 en cas d'erreur lors de la mise à jour", async () => {
      const error = new Error("Update error");
      req.params = { id: "1" };
      req.body = { name: "Updated Role" };
      Role.findByPk = jest.fn().mockRejectedValue(error);

      await roleController.updateRole(req as Request, res as Response);

      expect(Role.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("deleteRole", () => {
    it("devrait supprimer le rôle si trouvé", async () => {
      const role = { id: 1, name: "Role 1", destroy: jest.fn().mockResolvedValue(undefined) };
      req.params = { id: "1" };
      Role.findByPk = jest.fn().mockResolvedValue(role);

      await roleController.deleteRole(req as Request, res as Response);

      expect(Role.findByPk).toHaveBeenCalledWith("1");
      expect(role.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: "Rôle supprimé" });
    });

    it("devrait renvoyer un status 404 si le rôle n'est pas trouvé pour suppression", async () => {
      req.params = { id: "1" };
      Role.findByPk = jest.fn().mockResolvedValue(null);

      await roleController.deleteRole(req as Request, res as Response);

      expect(Role.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Rôle non trouvé" });
    });

    it("devrait renvoyer une erreur 500 en cas d'erreur lors de la suppression", async () => {
      const error = new Error("Delete error");
      req.params = { id: "1" };
      Role.findByPk = jest.fn().mockRejectedValue(error);

      await roleController.deleteRole(req as Request, res as Response);

      expect(Role.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
});
