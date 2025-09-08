import { Request, Response } from "express";
const { Setting } = require("../../models");
const statusController = require("../../controllers/status.controller");

jest.mock("../../models", () => ({
  Setting: {
    findOne: jest.fn(),
    upsert: jest.fn(),
  },
}));

describe("Status Controller", () => {
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

  describe("getStatus", () => {
    it("devrait renvoyer maintenance_mode: true si le mode maintenance est activé", async () => {
      (Setting.findOne as jest.Mock).mockResolvedValue({ key: "maintenance_mode", value: "true" });

      await statusController.getStatus(req as Request, res as Response);

      expect(Setting.findOne).toHaveBeenCalledWith({ where: { key: "maintenance_mode" } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ maintenance_mode: true });
    });

    it("devrait renvoyer maintenance_mode: false si le mode maintenance est désactivé", async () => {
      (Setting.findOne as jest.Mock).mockResolvedValue({ key: "maintenance_mode", value: "false" });

      await statusController.getStatus(req as Request, res as Response);

      expect(Setting.findOne).toHaveBeenCalledWith({ where: { key: "maintenance_mode" } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ maintenance_mode: false });
    });

    it("devrait renvoyer maintenance_mode: false si le paramètre n'existe pas", async () => {
      (Setting.findOne as jest.Mock).mockResolvedValue(null);

      await statusController.getStatus(req as Request, res as Response);

      expect(Setting.findOne).toHaveBeenCalledWith({ where: { key: "maintenance_mode" } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ maintenance_mode: false });
    });

    it("devrait renvoyer 500 en cas d'erreur serveur", async () => {
      (Setting.findOne as jest.Mock).mockRejectedValue(new Error("Database error"));

      await statusController.getStatus(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Erreur du serveur", error: "Database error" });
    });
  });

  describe("toggleStatus", () => {
    it("devrait activer le mode maintenance s'il est désactivé", async () => {
      (Setting.findOne as jest.Mock).mockResolvedValue({ key: "maintenance_mode", value: "false" });
      (Setting.upsert as jest.Mock).mockResolvedValue([{}, true]); // Mock upsert to indicate creation/update

      await statusController.toggleStatus(req as Request, res as Response);

      expect(Setting.findOne).toHaveBeenCalledWith({ where: { key: "maintenance_mode" } });
      expect(Setting.upsert).toHaveBeenCalledWith({ key: "maintenance_mode", value: "true" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Mode maintenance activé",
        maintenance_mode: true,
      });
    });

    it("devrait désactiver le mode maintenance s'il est activé", async () => {
      (Setting.findOne as jest.Mock).mockResolvedValue({ key: "maintenance_mode", value: "true" });
      (Setting.upsert as jest.Mock).mockResolvedValue([{}, false]); // Mock upsert

      await statusController.toggleStatus(req as Request, res as Response);

      expect(Setting.findOne).toHaveBeenCalledWith({ where: { key: "maintenance_mode" } });
      expect(Setting.upsert).toHaveBeenCalledWith({ key: "maintenance_mode", value: "false" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Mode maintenance désactivé",
        maintenance_mode: false,
      });
    });

    it("devrait activer le mode maintenance si le paramètre n'existe pas", async () => {
      (Setting.findOne as jest.Mock).mockResolvedValue(null);
      (Setting.upsert as jest.Mock).mockResolvedValue([{}, true]);

      await statusController.toggleStatus(req as Request, res as Response);

      expect(Setting.findOne).toHaveBeenCalledWith({ where: { key: "maintenance_mode" } });
      expect(Setting.upsert).toHaveBeenCalledWith({ key: "maintenance_mode", value: "true" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Mode maintenance activé",
        maintenance_mode: true,
      });
    });

    it("devrait renvoyer 500 en cas d'erreur serveur", async () => {
      (Setting.findOne as jest.Mock).mockRejectedValue(new Error("Toggle error"));

      await statusController.toggleStatus(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Erreur du serveur", error: "Toggle error" });
    });
  });
});
