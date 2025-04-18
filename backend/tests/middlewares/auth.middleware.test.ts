import { Request, Response, NextFunction } from "express";
import { protect, isAdmin, isWorker, isManager } from "../../middlewares/auth.middleware";
import jwt from "jsonwebtoken";

describe("Auth Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it("devrait renvoyer 401 si aucun token n'est fourni", () => {
    // Ici, req.headers est garanti d'exister
    protect(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Accès refusé. Token manquant" });
  });

  it("devrait appeler next() si le token est valide", () => {
    // Utilisation de l'opérateur non-null (!) pour indiquer à TypeScript que headers est défini
    req.headers!.authorization = "Bearer validtoken";
    // Utilisation de mockImplementation pour que jwt.verify retourne l'objet attendu
    jest.spyOn(jwt, "verify").mockImplementation(() => ({ userId: 1, role: 2 }));
    protect(req as Request, res as Response, next);
    // @ts-ignore : Ajouté car la propriété "user" n'existe pas par défaut sur Request
    expect(req.user).toEqual({ userId: 1, role: 2 });
    expect(next).toHaveBeenCalled();
  });

  it("devrait renvoyer 401 si le token est invalide", () => {
    req.headers!.authorization = "Bearer invalidtoken";
    jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw new Error("Invalid token");
    });
    protect(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token invalide" });
  });
});
