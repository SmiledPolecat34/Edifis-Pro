// Moquer la configuration de la base de données pour utiliser SQLite en mémoire
jest.mock("../../config/database", () => {
    const { Sequelize } = require("sequelize");
    return new Sequelize("sqlite::memory:", { logging: false });
  });
  
  import ConstructionSite from "../../models/ConstructionSite";
  import sequelize from "../../config/database";
  
  describe("ConstructionSite Model", () => {
    beforeAll(async () => {
      // Synchronise la base de données (SQLite en mémoire)
      await sequelize.sync({ force: true });
    });
  
    afterAll(async () => {
      await sequelize.close();
    });
  
    it("devrait avoir les attributs corrects", () => {
      const attributes = ConstructionSite.rawAttributes;
  
      // Vérification de la clé primaire et de l'auto-incrément
      expect(attributes).toHaveProperty("construction_site_id");
      expect(attributes.construction_site_id.primaryKey).toBe(true);
      expect(attributes.construction_site_id.autoIncrement).toBe(true);
  
      // Vérification du champ name
      expect(attributes).toHaveProperty("name");
      expect(attributes.name.allowNull).toBe(false);
  
      // Vérification du champ state (ENUM)
      expect(attributes).toHaveProperty("state");
      expect(attributes.state.allowNull).toBe(false);
      expect(attributes.state.values).toEqual(["En cours", "Terminé", "Annulé", "Prévu"]);
  
      // Vérification du champ description (TEXT)
      expect(attributes).toHaveProperty("description");
      expect((attributes.description.type as any).toString().toUpperCase()).toEqual("TEXT");
  
      // Vérification du champ adresse (STRING) : SQLite renvoie "VARCHAR(255)"
      expect(attributes).toHaveProperty("adresse");
      expect((attributes.adresse.type as any).toString().toUpperCase()).toContain("VARCHAR");
  
      // Vérification des dates (DATEONLY) : SQLite renvoie "DATE"
      expect(attributes).toHaveProperty("start_date");
      expect((attributes.start_date.type as any).toString().toUpperCase()).toContain("DATE");
  
      expect(attributes).toHaveProperty("end_date");
      expect((attributes.end_date.type as any).toString().toUpperCase()).toContain("DATE");
  
      // Vérification du champ date_creation (DATEONLY avec valeur par défaut)
      expect(attributes).toHaveProperty("date_creation");
      expect((attributes.date_creation.type as any).toString().toUpperCase()).toContain("DATE");
      expect(attributes.date_creation.defaultValue).toBeDefined();
  
      // Vérification des champs de temps (TIME)
      expect(attributes).toHaveProperty("open_time");
      expect((attributes.open_time.type as any).toString().toUpperCase()).toContain("TIME");
  
      expect(attributes).toHaveProperty("end_time");
      expect((attributes.end_time.type as any).toString().toUpperCase()).toContain("TIME");
    });
  
    it("devrait créer un chantier", async () => {
      const site = await ConstructionSite.create({
        name: "Site Test",
        state: "En cours",
        description: "Test site description",
        adresse: "123 Rue Test",
        start_date: "2023-01-01",
        end_date: "2023-01-10",
        open_time: "08:00",
        end_time: "17:00",
      });
      // Convertir l'instance en JSON pour accéder aux propriétés
      const siteJSON = site.toJSON();
      expect(siteJSON.construction_site_id).toBeDefined();
      expect(siteJSON.name).toBe("Site Test");
      expect(siteJSON.state).toBe("En cours");
      expect(siteJSON.description).toBe("Test site description");
      expect(siteJSON.adresse).toBe("123 Rue Test");
      expect(siteJSON.start_date).toBe("2023-01-01");
      expect(siteJSON.end_date).toBe("2023-01-10");
      // Adapter l'attente pour open_time et end_time : SQLite renvoie "08:00" et "17:00"
      expect(siteJSON.open_time).toBe("08:00");
      expect(siteJSON.end_time).toBe("17:00");
      // Vérification que date_creation est définie
      expect(siteJSON.date_creation).toBeDefined();
    });
  });
  