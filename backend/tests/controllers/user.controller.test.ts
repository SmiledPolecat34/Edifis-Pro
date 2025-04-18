import { Request, Response } from "express";
import { createUser, getAllUsers } from "../../controllers/user.controller";
import User from "../../models/User";
import bcrypt from "bcrypt";
import { Op } from "sequelize";

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
        message: "Tous les champs sont requis, y compris le numéro de téléphone"
      });
    });

    it("devrait renvoyer 400 si l'email est déjà utilisé", async () => {
      req.body = {
        firstname: "John",
        lastname: "Doe",
        email: "john@example.com",
        password: "secret",
        role_id: 2,
        numberphone: "123456"
      };
      (User.findOne as jest.Mock).mockResolvedValue({ email: "john@example.com" });
      await createUser(req as Request, res as Response);
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: "john@example.com" } });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Cet email est déjà utilisé" });
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
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      (User.create as jest.Mock).mockResolvedValue({ user_id: 1, firstname: "John" });

      await createUser(req as Request, res as Response);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: "john@example.com" } });
      expect(bcrypt.hash).toHaveBeenCalledWith("secret", 10);
      expect(User.create).toHaveBeenCalledWith({
        firstname: "John",
        lastname: "Doe",
        email: "john@example.com",
        password: "hashedPassword",
        role_id: 2,
        numberphone: "123456"
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Utilisateur créé avec succès",
        user: { user_id: 1, firstname: "John" }
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
            through: { attributes: [] }
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
});
