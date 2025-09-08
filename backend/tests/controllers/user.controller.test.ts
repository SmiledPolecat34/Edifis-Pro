import { Request, Response } from "express";
import { createUser, getAllUsers, deleteUser, getUserById } from "../../controllers/user.controller";
import User from "../../models/User";
import Role from "../../models/Role"; // Added
import Competence from "../../models/Competence"; // Added
import bcrypt from "bcrypt";
import { Op } from "sequelize";

// Define a minimal mock Request type
interface MockRequest extends Request {
  params: { id: string };
  body: any; // Add other properties as needed by the controller
  user?: any; // Add if req.user is used
}

// On simule les modules externes
jest.mock("../../models/User");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("User Controller", () => {
  describe("createUser", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
      req = {
        body: {},
        user: { role: 1 } // Pour simuler qu'un responsable effectue la requête
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });

    it("devrait renvoyer 400 si des champs requis sont manquants", async () => {
      req.body = { firstname: "John" }; // champs incomplets
      await createUser(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Tous les champs obligatoires doivent être fournis"
      });
    });

    it("devrait renvoyer 409 si l'email est déjà utilisé", async () => {
      req.body = {
        firstname: "John",
        lastname: "Doe",
        email: "john@example.com",
        password: "secret",
        role_id: 2,
        numberphone: "123456"
      };
      (User.create as jest.Mock).mockRejectedValue({ name: 'SequelizeUniqueConstraintError' }); // Mock create to throw unique constraint error
      await createUser(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: "L'email existe déjà" });
    });

    it("devrait créer un utilisateur et renvoyer un status 201", async () => {
      req.body = {
        firstname: "John",
        lastname: "Doe",
        email: "john@example.com",
        password: "secret",
        role_id: 2,
        numberphone: "123456"
      };
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      (User.create as jest.Mock).mockResolvedValue({ user_id: 1, firstname: "John" });

      await createUser(req as Request, res as Response);

      expect(bcrypt.hash).toHaveBeenCalledWith("secret", 10);
      expect(User.create).toHaveBeenCalledWith({
        firstname: "John",
        lastname: "Doe",
        email: "john@example.com",
        password: "hashedPassword",
        numberphone: "123456",
        role_id: 2,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        user_id: 1,
        firstname: "John",
        lastname: "Doe",
        email: "john@example.com",
        numberphone: "123456",
        role_id: 2,
      });
    });

    it("devrait renvoyer 500 en cas d'erreur lors de la création", async () => {
      req.body = {
        firstname: "John",
        lastname: "Doe",
        email: "john@example.com",
        password: "secret",
        role_id: 2,
        numberphone: "123456"
      };
      (User.findOne as jest.Mock).mockRejectedValue(new Error("Création échouée"));

      await createUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Création échouée" });
    });
  });

  describe("getAllUsers", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
      req = {};
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
    });

    it("devrait renvoyer la liste de tous les utilisateurs sans le mot de passe", async () => {
      const users = [
        {
          user_id: 1,
          firstname: "John",
          lastname: "Doe",
          email: "john@example.com",
          numberphone: "123456",
          profile_picture: "pic.jpg",
          Role: { name: "Worker" },
          Competences: [{ name: "Skill" }]
        }
      ];
      (User.findAll as jest.Mock).mockResolvedValue(users);

      await getAllUsers(req as Request, res as Response);

      expect(User.findAll).toHaveBeenCalledWith({
        attributes: ["user_id", "firstname", "lastname", "email", "numberphone", "profile_picture"],
        where: { role_id: { [Op.ne]: 1 } },
        include: [
          {
            model: expect.anything(),
            attributes: ["name"],
            required: true
          },
          {
            model: expect.anything(),
            attributes: ["name"],
          }
        ]
      });
      expect(res.json).toHaveBeenCalledWith(users);
    });

    it("devrait renvoyer 500 en cas d'erreur lors de la récupération", async () => {
      (User.findAll as jest.Mock).mockRejectedValue(new Error("Retrieval error"));
      await getAllUsers(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Retrieval error" });
    });
  });

  describe("deleteUser", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
      req = {
        params: { id: "1" },
      } as MockRequest; // Use MockRequest
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it("devrait supprimer un utilisateur et renvoyer un message de succès", async () => {
      const mockUser = {
        destroy: jest.fn().mockResolvedValue(true),
      };
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      await deleteUser(req as Request, res as Response);

      expect(User.findByPk).toHaveBeenCalledWith((req.params as { id: string }).id);
      expect(mockUser.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: "Utilisateur supprimé" });
    });

    it("devrait renvoyer 404 si l'utilisateur n'est pas trouvé", async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await deleteUser(req as Request, res as Response);

      expect(User.findByPk).toHaveBeenCalledWith((req.params as { id: string }).id);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Utilisateur non trouvé" });
    });

    it("devrait renvoyer 500 en cas d'erreur lors de la suppression", async () => {
      (User.findByPk as jest.Mock).mockRejectedValue(new Error("Deletion error"));

      await deleteUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Deletion error" });
    });
  });

  describe("getUserById", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
      req = {
        params: { id: "1" },
      } as MockRequest; // Use MockRequest
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it("devrait renvoyer un utilisateur par ID", async () => {
      const mockUser = {
        user_id: 1,
        firstname: "Jane",
        lastname: "Doe",
        email: "jane@example.com",
      };
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      await getUserById(req as Request, res as Response);

      expect(User.findByPk).toHaveBeenCalledWith((req.params as { id: string }).id, expect.any(Object));
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it("devrait renvoyer 404 si l'utilisateur n'est pas trouvé", async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await getUserById(req as Request, res as Response);

      expect(User.findByPk).toHaveBeenCalledWith((req.params as { id: string }).id, expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Utilisateur non trouvé" });
    });

    it("devrait renvoyer 500 en cas d'erreur lors de la récupération par ID", async () => {
      (User.findByPk as jest.Mock).mockRejectedValue(new Error("Retrieval by ID error"));

      await getUserById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Retrieval by ID error" });
    });
  });

  describe("updateUser", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
      req = {
        params: { id: "1" },
        body: {},
      } as MockRequest;
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it("devrait mettre à jour un utilisateur et renvoyer les informations mises à jour", async () => {
      const mockUser = {
        user_id: 1,
        firstname: "Old",
        lastname: "Name",
        email: "old@example.com",
        numberphone: "1111111111",
        profile_picture: null,
        role: { name: "Worker" },
        competences: [],
        update: jest.fn().mockResolvedValue(true),
        setCompetences: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnThis(), // Mock toJSON for the normalized response
      };

      (User.findByPk as jest.Mock)
        .mockResolvedValueOnce(mockUser) // For the initial findByPk
        .mockResolvedValueOnce({
          // For the second findByPk after update
          user_id: 1,
          firstname: "New",
          lastname: "User",
          email: "old@example.com",
          numberphone: "1111111111",
          profile_picture: null,
          role: { name: "Worker" },
          competences: [],
          toJSON: jest.fn().mockReturnThis(),
        });

      req.body = {
        firstname: "New",
        lastname: "User",
      };

      await userController.updateUser(req as Request, res as Response);

      expect(User.findByPk).toHaveBeenCalledWith("1", expect.any(Object));
      expect(mockUser.update).toHaveBeenCalledWith({
        firstname: "New",
        lastname: "User",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Utilisateur mis à jour",
        user: {
          user_id: 1,
          firstname: "New",
          lastname: "User",
          email: "old@example.com",
          numberphone: "1111111111",
          profile_picture: null,
          role: "Worker",
          competences: [],
        },
      });
    });

    it("devrait renvoyer 404 si l'utilisateur n'est pas trouvé", async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await userController.updateUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Utilisateur non trouvé" });
    });

    it("devrait renvoyer 500 en cas d'erreur lors de la mise à jour", async () => {
      (User.findByPk as jest.Mock).mockRejectedValue(new Error("Update error"));

      await userController.updateUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Update error" });
    });
  });
});
