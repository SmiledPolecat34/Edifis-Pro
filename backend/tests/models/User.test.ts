// Moquer la configuration de la base de données pour utiliser SQLite en mémoire
jest.mock("../../config/database", () => {
    const { Sequelize } = require("sequelize");
    return new Sequelize("sqlite::memory:", { logging: false });
  });
  
  import User from "../../models/User";
  import sequelize from "../../config/database";
  
  describe("User Model", () => {
    beforeAll(async () => {
      await sequelize.sync({ force: true });
    });
    
    afterAll(async () => {
      await sequelize.close();
    });
    
    it("devrait avoir les attributs corrects", () => {
      const attributes = User.rawAttributes;
      
      expect(attributes).toHaveProperty("user_id");
      expect(attributes.user_id.primaryKey).toBe(true);
      expect(attributes.user_id.autoIncrement).toBe(true);
      
      expect(attributes).toHaveProperty("firstname");
      expect(attributes.firstname.allowNull).toBe(false);
      
      expect(attributes).toHaveProperty("lastname");
      expect(attributes.lastname.allowNull).toBe(false);
      
      expect(attributes).toHaveProperty("email");
      expect(attributes.email.allowNull).toBe(false);
      expect(attributes.email.unique).toBe(true);
      
      expect(attributes).toHaveProperty("password");
      expect(attributes.password.allowNull).toBe(false);
      
      expect(attributes).toHaveProperty("created_at");
      expect((attributes.created_at.type as any).toString().toUpperCase()).toContain("DATE");
    });
    
    it("devrait créer un utilisateur", async () => {
      const user = await User.create({
        firstname: "Test",
        lastname: "User",
        email: "test@example.com",
        numberphone: "0123456789" ,
        password: "password",
      });
      const userJSON = user.toJSON();
      expect(userJSON.user_id).toBeDefined();
      expect(userJSON.firstname).toBe("Test");
      expect(userJSON.lastname).toBe("User");
      expect(userJSON.email).toBe("test@example.com");
      expect(userJSON.password).toBe("password");
      expect(userJSON.created_at).toBeDefined();
    });
  });
  