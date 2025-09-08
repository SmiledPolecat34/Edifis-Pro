import { DataTypes } from "sequelize";
import Setting from "../../models/Setting";
import { sequelize } from "../../config/sequelize";

describe("Setting Model", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // Recreate table for each test suite
  });

  afterEach(async () => {
    await Setting.destroy({ truncate: true }); // Clear data after each test
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("devrait avoir les attributs corrects", () => {
    const attributes = Setting.rawAttributes;

    expect(attributes).toHaveProperty("key");
    expect(attributes.key.primaryKey).toBe(true);
    expect(attributes.key.allowNull).toBe(false);
    expect(attributes.key.type.key).toEqual(DataTypes.STRING.key);

    expect(attributes).toHaveProperty("value");
    expect(attributes.value.allowNull).toBe(false);
    expect(attributes.value.type.key).toEqual(DataTypes.STRING.key);

    expect(attributes).toHaveProperty("createdAt");
    expect(attributes).toHaveProperty("updatedAt");
  });

  it("devrait créer un paramètre", async () => {
    const setting = await Setting.create({
      key: "test_key",
      value: "test_value",
    });
    expect(setting.key).toBe("test_key");
    expect(setting.value).toBe("test_value");
    expect(setting.createdAt).toBeDefined();
    expect(setting.updatedAt).toBeDefined();
  });

  it("devrait mettre à jour un paramètre existant", async () => {
    await Setting.create({
      key: "update_key",
      value: "old_value",
    });

    const updatedSetting = await Setting.update(
      { value: "new_value" },
      { where: { key: "update_key" } }
    );
    expect(updatedSetting[0]).toBe(1); // Number of affected rows

    const foundSetting = await Setting.findByPk("update_key");
    expect(foundSetting.value).toBe("new_value");
  });

  it("devrait trouver un paramètre par sa clé", async () => {
    await Setting.create({
      key: "find_key",
      value: "find_value",
    });

    const foundSetting = await Setting.findByPk("find_key");
    expect(foundSetting).toBeDefined();
    expect(foundSetting.value).toBe("find_value");
  });

  it("ne devrait pas créer un paramètre sans clé", async () => {
    await expect(Setting.create({ value: "some_value" })).rejects.toThrow();
  });

  it("ne devrait pas créer un paramètre sans valeur", async () => {
    await expect(Setting.create({ key: "some_key" })).rejects.toThrow();
  });
});
