jest.mock("../../config/database", () => {
    const { Sequelize } = require("sequelize");
    return new Sequelize("sqlite::memory:", { logging: false });
  });
  
import Role from "../../models/Role";
import sequelize from "../../config/database";

describe("Role Model", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("devrait avoir les attributs corrects", () => {
    const attributes = Role.rawAttributes;

    expect(attributes).toHaveProperty("role_id");
    expect(attributes.role_id.primaryKey).toBe(true);
    expect(attributes.role_id.autoIncrement).toBe(true);

    expect(attributes).toHaveProperty("name");
    expect(attributes.name.allowNull).toBe(false);
    expect(attributes.name.values).toEqual(["Admin", "Worker", "Manager", "Project_Chief", "HR"]);
  });

  it("devrait créer un rôle", async () => {
    const role = await Role.create({
      name: "Worker",
    });
    const roleJSON = role.toJSON();
    expect(roleJSON.role_id).toBeDefined();
    expect(roleJSON.name).toBe("Worker");
  });

  it("ne devrait pas créer un rôle avec un nom invalide", async () => {
    await expect(
      Role.create({
        name: "InvalidRole",
      })
    ).rejects.toThrow();
  });
});
  