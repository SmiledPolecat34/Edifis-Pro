import { Request, Response } from "express";
const ConstructionSite = require("../../models/ConstructionSite");
const constructionSiteController = require("../../controllers/constructionSite.controller");

describe("ConstructionSite Controller", () => {
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

  describe("createConstructionSite", () => {
    it("devrait créer un chantier et renvoyer un status 201", async () => {
      const newSite = { name: "Chantier Test" };
      req.body = newSite;
      // On simule la création avec le modèle
      ConstructionSite.create = jest.fn().mockResolvedValue(newSite);

      await constructionSiteController.createConstructionSite(req as Request, res as Response);

      expect(ConstructionSite.create).toHaveBeenCalledWith(newSite);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newSite);
    });

    it("devrait renvoyer une erreur 500 en cas d'échec lors de la création", async () => {
      const error = new Error("Erreur de création");
      ConstructionSite.create = jest.fn().mockRejectedValue(error);
      req.body = {};

      await constructionSiteController.createConstructionSite(req as Request, res as Response);

      expect(ConstructionSite.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("getAllConstructionSites", () => {
    it("devrait renvoyer tous les chantiers", async () => {
      const sites = [{ id: 1, name: "Chantier 1" }, { id: 2, name: "Chantier 2" }];
      ConstructionSite.findAll = jest.fn().mockResolvedValue(sites);

      await constructionSiteController.getAllConstructionSites(req as Request, res as Response);

      expect(ConstructionSite.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(sites);
    });

    it("devrait renvoyer une erreur 500 en cas d'échec lors de la récupération", async () => {
      const error = new Error("Erreur de récupération");
      ConstructionSite.findAll = jest.fn().mockRejectedValue(error);

      await constructionSiteController.getAllConstructionSites(req as Request, res as Response);

      expect(ConstructionSite.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("getConstructionSiteById", () => {
    it("devrait renvoyer le chantier si trouvé", async () => {
      const site = { id: 1, name: "Chantier 1" };
      req.params = { id: "1" };
      ConstructionSite.findByPk = jest.fn().mockResolvedValue(site);

      await constructionSiteController.getConstructionSiteById(req as Request, res as Response);

      expect(ConstructionSite.findByPk).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith(site);
    });

    it("devrait renvoyer un status 404 si le chantier n'est pas trouvé", async () => {
      req.params = { id: "1" };
      ConstructionSite.findByPk = jest.fn().mockResolvedValue(null);

      await constructionSiteController.getConstructionSiteById(req as Request, res as Response);

      expect(ConstructionSite.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Chantier non trouvé" });
    });

    it("devrait renvoyer une erreur 500 en cas d'erreur lors de la récupération", async () => {
      const error = new Error("Erreur de recherche");
      req.params = { id: "1" };
      ConstructionSite.findByPk = jest.fn().mockRejectedValue(error);

      await constructionSiteController.getConstructionSiteById(req as Request, res as Response);

      expect(ConstructionSite.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("updateConstructionSite", () => {
    it("devrait mettre à jour le chantier si trouvé", async () => {
      const site = {
        id: 1,
        name: "Ancien Chantier",
        update: jest.fn().mockResolvedValue({ id: 1, name: "Nouveau Chantier" }),
      };
      req.params = { id: "1" };
      req.body = { name: "Nouveau Chantier" };
      ConstructionSite.findByPk = jest.fn().mockResolvedValue(site);

      await constructionSiteController.updateConstructionSite(req as Request, res as Response);

      expect(ConstructionSite.findByPk).toHaveBeenCalledWith("1");
      expect(site.update).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(site);
    });

    it("devrait renvoyer un status 404 si le chantier n'est pas trouvé pour mise à jour", async () => {
      req.params = { id: "1" };
      req.body = { name: "Nouveau Chantier" };
      ConstructionSite.findByPk = jest.fn().mockResolvedValue(null);

      await constructionSiteController.updateConstructionSite(req as Request, res as Response);

      expect(ConstructionSite.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Chantier non trouvé" });
    });

    it("devrait renvoyer une erreur 500 en cas d'erreur lors de la mise à jour", async () => {
      const error = new Error("Erreur de mise à jour");
      req.params = { id: "1" };
      req.body = { name: "Nouveau Chantier" };
      ConstructionSite.findByPk = jest.fn().mockRejectedValue(error);

      await constructionSiteController.updateConstructionSite(req as Request, res as Response);

      expect(ConstructionSite.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("deleteConstructionSite", () => {
    it("devrait supprimer le chantier si trouvé", async () => {
      const site = { id: 1, name: "Chantier 1", destroy: jest.fn().mockResolvedValue(undefined) };
      req.params = { id: "1" };
      ConstructionSite.findByPk = jest.fn().mockResolvedValue(site);

      await constructionSiteController.deleteConstructionSite(req as Request, res as Response);

      expect(ConstructionSite.findByPk).toHaveBeenCalledWith("1");
      expect(site.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: "Chantier supprimé" });
    });

    it("devrait renvoyer un status 404 si le chantier n'est pas trouvé pour suppression", async () => {
      req.params = { id: "1" };
      ConstructionSite.findByPk = jest.fn().mockResolvedValue(null);

      await constructionSiteController.deleteConstructionSite(req as Request, res as Response);

      expect(ConstructionSite.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Chantier non trouvé" });
    });

    it("devrait renvoyer une erreur 500 en cas d'erreur lors de la suppression", async () => {
      const error = new Error("Erreur de suppression");
      req.params = { id: "1" };
      ConstructionSite.findByPk = jest.fn().mockRejectedValue(error);

      await constructionSiteController.deleteConstructionSite(req as Request, res as Response);

      expect(ConstructionSite.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
});
