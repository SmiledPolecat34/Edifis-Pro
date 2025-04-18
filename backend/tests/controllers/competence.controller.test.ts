import { Request, Response } from "express";
const Competence = require("../../models/Competence");
const competenceController = require("../../controllers/competence.controller");

describe("Competence Controller", () => {
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

  describe("createCompetence", () => {
    it("devrait créer une compétence et renvoyer un status 201", async () => {
      const newCompetence = { name: "Test competence" };
      req.body = newCompetence;
      // On simule la méthode create pour renvoyer la nouvelle compétence
      Competence.create = jest.fn().mockResolvedValue(newCompetence);

      await competenceController.createCompetence(req as Request, res as Response);

      expect(Competence.create).toHaveBeenCalledWith(newCompetence);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newCompetence);
    });

    it("devrait renvoyer une erreur 500 en cas d'échec lors de la création", async () => {
      const error = new Error("Create error");
      Competence.create = jest.fn().mockRejectedValue(error);
      req.body = {};

      await competenceController.createCompetence(req as Request, res as Response);

      expect(Competence.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("getAllCompetences", () => {
    it("devrait renvoyer toutes les compétences", async () => {
      const competences = [{ id: 1, name: "Compétence1" }, { id: 2, name: "Compétence2" }];
      Competence.findAll = jest.fn().mockResolvedValue(competences);

      await competenceController.getAllCompetences(req as Request, res as Response);

      expect(Competence.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(competences);
    });

    it("devrait renvoyer une erreur 500 en cas d'échec lors de la récupération", async () => {
      const error = new Error("Find all error");
      Competence.findAll = jest.fn().mockRejectedValue(error);

      await competenceController.getAllCompetences(req as Request, res as Response);

      expect(Competence.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("getCompetenceById", () => {
    it("devrait renvoyer la compétence si elle est trouvée", async () => {
      const competence = { id: 1, name: "Compétence1" };
      req.params = { id: "1" };
      Competence.findByPk = jest.fn().mockResolvedValue(competence);

      await competenceController.getCompetenceById(req as Request, res as Response);

      expect(Competence.findByPk).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith(competence);
    });

    it("devrait renvoyer un status 404 si la compétence n'est pas trouvée", async () => {
      req.params = { id: "1" };
      Competence.findByPk = jest.fn().mockResolvedValue(null);

      await competenceController.getCompetenceById(req as Request, res as Response);

      expect(Competence.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Compétence non trouvée" });
    });

    it("devrait renvoyer une erreur 500 en cas d'erreur lors de la récupération", async () => {
      const error = new Error("Find error");
      req.params = { id: "1" };
      Competence.findByPk = jest.fn().mockRejectedValue(error);

      await competenceController.getCompetenceById(req as Request, res as Response);

      expect(Competence.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("updateCompetence", () => {
    it("devrait mettre à jour la compétence si elle est trouvée", async () => {
      const competence = {
        id: 1,
        name: "Ancien nom",
        update: jest.fn().mockResolvedValue({ id: 1, name: "Nouveau nom" }),
      };
      req.params = { id: "1" };
      req.body = { name: "Nouveau nom" };
      Competence.findByPk = jest.fn().mockResolvedValue(competence);

      await competenceController.updateCompetence(req as Request, res as Response);

      expect(Competence.findByPk).toHaveBeenCalledWith("1");
      expect(competence.update).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(competence);
    });

    it("devrait renvoyer un status 404 si la compétence n'est pas trouvée", async () => {
      req.params = { id: "1" };
      req.body = { name: "Nouveau nom" };
      Competence.findByPk = jest.fn().mockResolvedValue(null);

      await competenceController.updateCompetence(req as Request, res as Response);

      expect(Competence.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Compétence non trouvée" });
    });

    it("devrait renvoyer une erreur 500 en cas d'erreur lors de la mise à jour", async () => {
      const error = new Error("Update error");
      req.params = { id: "1" };
      req.body = { name: "Nouveau nom" };
      Competence.findByPk = jest.fn().mockRejectedValue(error);

      await competenceController.updateCompetence(req as Request, res as Response);

      expect(Competence.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("deleteCompetence", () => {
    it("devrait supprimer la compétence si elle est trouvée", async () => {
      const competence = { id: 1, name: "Compétence1", destroy: jest.fn().mockResolvedValue(undefined) };
      req.params = { id: "1" };
      Competence.findByPk = jest.fn().mockResolvedValue(competence);

      await competenceController.deleteCompetence(req as Request, res as Response);

      expect(Competence.findByPk).toHaveBeenCalledWith("1");
      expect(competence.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: "Compétence supprimée" });
    });

    it("devrait renvoyer un status 404 si la compétence n'est pas trouvée", async () => {
      req.params = { id: "1" };
      Competence.findByPk = jest.fn().mockResolvedValue(null);

      await competenceController.deleteCompetence(req as Request, res as Response);

      expect(Competence.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Compétence non trouvée" });
    });

    it("devrait renvoyer une erreur 500 en cas d'erreur lors de la suppression", async () => {
      const error = new Error("Delete error");
      req.params = { id: "1" };
      Competence.findByPk = jest.fn().mockRejectedValue(error);

      await competenceController.deleteCompetence(req as Request, res as Response);

      expect(Competence.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
});
