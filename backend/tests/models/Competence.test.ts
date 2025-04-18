// Moquer la configuration de la base de données pour utiliser SQLite en mémoire pour les tests
jest.mock("../../config/database", () => {
    const { Sequelize } = require("sequelize");
    return new Sequelize("sqlite::memory:", { logging: false });
  });
  
  import Competence from "../../models/Competence";
  import sequelize from "../../config/database";
  
  describe("Competence Model", () => {
    beforeAll(async () => {
      // Synchronise la base de données (SQLite en mémoire)
      await sequelize.sync({ force: true });
    });
  
    afterAll(async () => {
      await sequelize.close();
    });
  
    it("devrait avoir les attributs corrects", () => {
      const attributes = Competence.rawAttributes;
      expect(attributes).toHaveProperty("competence_id");
      expect(attributes.competence_id.primaryKey).toBe(true);
      expect(attributes.competence_id.autoIncrement).toBe(true);
  
      expect(attributes).toHaveProperty("name");
      expect(attributes.name.allowNull).toBe(false);
  
      expect(attributes).toHaveProperty("description");
      // Cast en any pour éviter l'erreur de typage sur toString()
      expect((attributes.description.type as any).toString().toUpperCase()).toEqual("TEXT");
    });
  
    it("devrait créer une compétence", async () => {
      const competence = await Competence.create({
        name: "Test Competence",
        description: "Ceci est une compétence de test",
      });
      // Convertit l'instance en JSON pour accéder aux propriétés
      const comp = competence.toJSON();
      expect(comp.competence_id).toBeDefined();
      expect(comp.name).toBe("Test Competence");
      expect(comp.description).toBe("Ceci est une compétence de test");
    });
  });
  