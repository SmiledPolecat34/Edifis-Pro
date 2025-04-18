import { Request, Response } from "express";
const Timesheet = require("../../models/Timesheet");
const timesheetController = require("../../controllers/timesheet.controller");

describe("Timesheet Controller", () => {
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

  describe("createTimesheet", () => {
    it("devrait créer une feuille de temps et renvoyer un status 201", async () => {
      const newTimesheet = { hours: 8, date: "2021-10-10" };
      req.body = newTimesheet;
      Timesheet.create = jest.fn().mockResolvedValue(newTimesheet);

      await timesheetController.createTimesheet(req as Request, res as Response);

      expect(Timesheet.create).toHaveBeenCalledWith(newTimesheet);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newTimesheet);
    });

    it("devrait renvoyer une erreur 500 en cas d'échec lors de la création", async () => {
      const error = new Error("Creation error");
      Timesheet.create = jest.fn().mockRejectedValue(error);
      req.body = {};

      await timesheetController.createTimesheet(req as Request, res as Response);

      expect(Timesheet.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("getAllTimesheets", () => {
    it("devrait renvoyer toutes les feuilles de temps", async () => {
      const timesheets = [{ id: 1, hours: 8 }, { id: 2, hours: 6 }];
      Timesheet.findAll = jest.fn().mockResolvedValue(timesheets);

      await timesheetController.getAllTimesheets(req as Request, res as Response);

      expect(Timesheet.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(timesheets);
    });

    it("devrait renvoyer une erreur 500 en cas d'échec lors de la récupération", async () => {
      const error = new Error("Retrieval error");
      Timesheet.findAll = jest.fn().mockRejectedValue(error);

      await timesheetController.getAllTimesheets(req as Request, res as Response);

      expect(Timesheet.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("getTimesheetById", () => {
    it("devrait renvoyer la feuille de temps si elle est trouvée", async () => {
      const timesheet = { id: 1, hours: 8 };
      req.params = { id: "1" };
      Timesheet.findByPk = jest.fn().mockResolvedValue(timesheet);

      await timesheetController.getTimesheetById(req as Request, res as Response);

      expect(Timesheet.findByPk).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith(timesheet);
    });

    it("devrait renvoyer un status 404 si la feuille de temps n'est pas trouvée", async () => {
      req.params = { id: "1" };
      Timesheet.findByPk = jest.fn().mockResolvedValue(null);

      await timesheetController.getTimesheetById(req as Request, res as Response);

      expect(Timesheet.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Timesheet non trouvé" });
    });

    it("devrait renvoyer une erreur 500 en cas d'échec lors de la récupération", async () => {
      const error = new Error("Retrieval error");
      req.params = { id: "1" };
      Timesheet.findByPk = jest.fn().mockRejectedValue(error);

      await timesheetController.getTimesheetById(req as Request, res as Response);

      expect(Timesheet.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("updateTimesheet", () => {
    it("devrait mettre à jour la feuille de temps si elle est trouvée", async () => {
      const timesheet = {
        id: 1,
        hours: 8,
        update: jest.fn().mockResolvedValue({ id: 1, hours: 10 }),
      };
      req.params = { id: "1" };
      req.body = { hours: 10 };
      Timesheet.findByPk = jest.fn().mockResolvedValue(timesheet);

      await timesheetController.updateTimesheet(req as Request, res as Response);

      expect(Timesheet.findByPk).toHaveBeenCalledWith("1");
      expect(timesheet.update).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(timesheet);
    });

    it("devrait renvoyer un status 404 si la feuille de temps n'est pas trouvée pour mise à jour", async () => {
      req.params = { id: "1" };
      req.body = { hours: 10 };
      Timesheet.findByPk = jest.fn().mockResolvedValue(null);

      await timesheetController.updateTimesheet(req as Request, res as Response);

      expect(Timesheet.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Timesheet non trouvé" });
    });

    it("devrait renvoyer une erreur 500 en cas d'échec lors de la mise à jour", async () => {
      const error = new Error("Update error");
      req.params = { id: "1" };
      req.body = { hours: 10 };
      Timesheet.findByPk = jest.fn().mockRejectedValue(error);

      await timesheetController.updateTimesheet(req as Request, res as Response);

      expect(Timesheet.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe("deleteTimesheet", () => {
    it("devrait supprimer la feuille de temps si elle est trouvée", async () => {
      const timesheet = { id: 1, hours: 8, destroy: jest.fn().mockResolvedValue(undefined) };
      req.params = { id: "1" };
      Timesheet.findByPk = jest.fn().mockResolvedValue(timesheet);

      await timesheetController.deleteTimesheet(req as Request, res as Response);

      expect(Timesheet.findByPk).toHaveBeenCalledWith("1");
      expect(timesheet.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: "Timesheet supprimé" });
    });

    it("devrait renvoyer un status 404 si la feuille de temps n'est pas trouvée pour suppression", async () => {
      req.params = { id: "1" };
      Timesheet.findByPk = jest.fn().mockResolvedValue(null);

      await timesheetController.deleteTimesheet(req as Request, res as Response);

      expect(Timesheet.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Timesheet non trouvé" });
    });

    it("devrait renvoyer une erreur 500 en cas d'échec lors de la suppression", async () => {
      const error = new Error("Deletion error");
      req.params = { id: "1" };
      Timesheet.findByPk = jest.fn().mockRejectedValue(error);

      await timesheetController.deleteTimesheet(req as Request, res as Response);

      expect(Timesheet.findByPk).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
});
