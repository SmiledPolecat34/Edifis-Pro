import Role from "../../models/Role";

describe("Role Model", () => {
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
  