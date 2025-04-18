const { User, Task, ConstructionSite, Timesheet, Competence, Role } = require("../../models");

describe("Models Associations", () => {
  it("User devrait appartenir à Role et Role devrait avoir plusieurs Users", () => {
    // Par défaut, l'association de User vers Role est nommée "role"
    // et celle de Role vers User est nommée "users"
    expect(User.associations).toHaveProperty("role");
    expect(Role.associations).toHaveProperty("users");
  });

  it("User devrait avoir plusieurs Tasks et Task devrait appartenir à User", () => {
    expect(User.associations).toHaveProperty("Tasks");
    // L'association de Task vers User, via belongsToMany, est par défaut nommée "users"
    expect(Task.associations).toHaveProperty("users");
  });

  it("ConstructionSite devrait avoir plusieurs Tasks et Task devrait appartenir à ConstructionSite", () => {
    expect(ConstructionSite.associations).toHaveProperty("Tasks");
    expect(Task.associations).toHaveProperty("construction_site");
  });

  it("User devrait avoir plusieurs Timesheets et Timesheet devrait appartenir à User", () => {
    // L'association de User vers Timesheet est nommée "timesheets"
    expect(User.associations).toHaveProperty("timesheets");
    // L'association de Timesheet vers User est nommée "user"
    expect(Timesheet.associations).toHaveProperty("user");
  });

  it("User devrait appartenir à plusieurs Competences et Competence devrait appartenir à plusieurs Users", () => {
    // L'association de User vers Competence est nommée "competences"
    expect(User.associations).toHaveProperty("competences");
    // Celle de Competence vers User est nommée "users"
    expect(Competence.associations).toHaveProperty("users");
  });
});
