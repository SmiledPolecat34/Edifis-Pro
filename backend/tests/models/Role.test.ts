// Pour utiliser SQLite en mémoire dans les tests, on peut moquer la configuration de la DB si besoin
jest.mock("../../config/database", () => {
    const { Sequelize } = require("sequelize");
    return new Sequelize("sqlite::memory:", { logging: false });
  });
  
  import Role from "../../models/Role";
  import sequelize from "../../config/database";
  
  describe("Role Model", () => {
    beforeAll(async () => {
      // Synchroniser la base de données (SQLite en mémoire)
      await sequelize.sync({ force: true });
    });
  
    afterAll(async () => {
      await sequelize.close();
    });
  
    it("devrait avoir les attributs corrects", () => {
      const attributes = Role.rawAttributes;
  
      // Vérifier l'attribut role_id
      expect(attributes).toHaveProperty("role_id");
      expect(attributes.role_id.primaryKey).toBe(true);
      expect(attributes.role_id.autoIncrement).toBe(true);
  
      // Vérifier l'attribut name
      expect(attributes).toHaveProperty("name");
      expect(attributes.name.allowNull).toBe(false);
      // Pour vérifier l'énumération, on peut accéder à la propriété 'values'
      expect(attributes.name.values).toEqual(["Admin", "Worker", "Manager"]);
    });
  
    it("devrait créer un rôle", async () => {
      const role = await Role.create({
        name: "Worker",
      });
      const roleJSON = role.toJSON();
      expect(roleJSON.role_id).toBeDefined();
      expect(roleJSON.name).toBe("Worker");
    });
  });
  