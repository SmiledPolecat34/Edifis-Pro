import { DataTypes } from "sequelize";
import UserTask from "../../models/UserTask";
import { sequelize } from "../../config/sequelize";

describe("UserTask Model", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // Recreate table for each test suite
  });

  afterEach(async () => {
    await UserTask.destroy({ truncate: true }); // Clear data after each test
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("devrait avoir les attributs corrects et une clé primaire composite", () => {
    const attributes = UserTask.rawAttributes;

    expect(attributes).toHaveProperty("user_id");
    expect(attributes.user_id.primaryKey).toBe(true);
    expect(attributes.user_id.type.key).toEqual(DataTypes.INTEGER.key);

    expect(attributes).toHaveProperty("task_id");
    expect(attributes.task_id.primaryKey).toBe(true);
    expect(attributes.task_id.type.key).toEqual(DataTypes.INTEGER.key);

    expect(attributes).toHaveProperty("createdAt");
    expect(attributes).toHaveProperty("updatedAt");
  });

  it("devrait créer une association utilisateur-tâche", async () => {
    const userTask = await UserTask.create({
      user_id: 1,
      task_id: 101,
    });
    expect(userTask.user_id).toBe(1);
    expect(userTask.task_id).toBe(101);
    expect(userTask.createdAt).toBeDefined();
    expect(userTask.updatedAt).toBeDefined();
  });

  it("ne devrait pas créer une association en double", async () => {
    await UserTask.create({
      user_id: 2,
      task_id: 201,
    });

    await expect(
      UserTask.create({
        user_id: 2,
        task_id: 201,
      })
    ).rejects.toThrow();
  });

  it("devrait supprimer une association utilisateur-tâche", async () => {
    await UserTask.create({
      user_id: 3,
      task_id: 301,
    });

    const deletedRows = await UserTask.destroy({
      where: {
        user_id: 3,
        task_id: 301,
      },
    });
    expect(deletedRows).toBe(1);

    const found = await UserTask.findOne({
      where: {
        user_id: 3,
        task_id: 301,
      },
    });
    expect(found).toBeNull();
  });
});
