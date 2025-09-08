import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { validate } from "../../middlewares/validator.middleware";

describe("Validator Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  const testSchema = Joi.object({
    name: Joi.string().required(),
    age: Joi.number().integer().min(0).required(),
    optionalField: Joi.string().optional(),
  });

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("devrait appeler next() et nettoyer req.body si la validation réussit", () => {
    req.body = { name: "John Doe", age: 30, extraField: "shouldBeRemoved" };
    const middleware = validate(testSchema);

    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(req.body).toEqual({ name: "John Doe", age: 30 }); // extraField should be removed
  });

  it("devrait renvoyer 400 et les détails de l'erreur si la validation échoue", () => {
    req.body = { name: "John Doe" }; // Missing age
    const middleware = validate(testSchema);

    middleware(req as Request, res as Response, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Erreur de validation",
      details: ["\"age\" is required"],
    });
  });

  it("devrait renvoyer 400 si un champ inconnu est présent et allowUnknown est false", () => {
    // By default, allowUnknown is false in the validate function options
    req.body = { name: "John Doe", age: 30, unknown: "field" };
    const middleware = validate(testSchema);

    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled(); // stripUnknown is true, so it passes but removes unknown
    expect(res.status).not.toHaveBeenCalled();
    expect(req.body).toEqual({ name: "John Doe", age: 30 });
  });

  it("devrait gérer plusieurs erreurs de validation", () => {
    req.body = { name: 123, age: "abc" }; // Invalid types
    const middleware = validate(testSchema);

    middleware(req as Request, res as Response, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Erreur de validation",
      details: ["\"name\" must be a string", "\"age\" must be a number"],
    });
  });
});
