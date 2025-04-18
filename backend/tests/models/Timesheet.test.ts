// Moquer la configuration de la base de données pour utiliser SQLite en mémoire
jest.mock("../../config/database", () => {
    const { Sequelize } = require("sequelize");
    return new Sequelize("sqlite::memory:", { logging: false });
  });
  
  import Timesheet from "../../models/Timesheet";
  import sequelize from "../../config/database";
  
  describe("Timesheet Model", () => {
    beforeAll(async () => {
      await sequelize.sync({ force: true });
    });
    
    afterAll(async () => {
      await sequelize.close();
    });
    
    it("devrait créer une feuille de temps", async () => {
      const ts = await Timesheet.create({
        start_date: "2023-01-01",
        end_date: "2023-01-02",
      });
      const tsJSON = ts.toJSON();
      expect(tsJSON.timesheet_id).toBeDefined();
      expect(new Date(tsJSON.start_date).toISOString().substring(0, 10)).toBe("2023-01-01");
      expect(new Date(tsJSON.end_date).toISOString().substring(0, 10)).toBe("2023-01-02");
    });
  });
  