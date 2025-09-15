import { Request, Response, NextFunction } from "express";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { rateLimitIP, rateLimitIPAndEmail } from "../../middlewares/rateLimit.middleware";

jest.mock("rate-limiter-flexible", () => ({
  RateLimiterMemory: jest.fn().mockImplementation(() => ({
    consume: jest.fn(),
  })),
}));

describe("Rate Limit Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let consumeMock: jest.Mock;

  beforeEach(() => {
    req = {
      ip: "127.0.0.1",
      headers: {},
      connection: { remoteAddress: "127.0.0.1" } as any,
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    consumeMock = jest.fn().mockResolvedValue(undefined);
    (RateLimiterMemory as jest.Mock).mockClear();
    (RateLimiterMemory as jest.Mock).mockImplementation(() => ({
      consume: consumeMock,
    }));

    delete process.env.DISABLE_RATE_LIMIT;
    delete process.env.RATE_LIMIT_POINTS;
    delete process.env.RATE_LIMIT_DURATION;
    delete process.env.RATE_LIMIT_IP_POINTS;
    delete process.env.RATE_LIMIT_IP_DURATION;
    delete process.env.RATE_LIMIT_EMAIL_POINTS;
    delete process.env.RATE_LIMIT_EMAIL_DURATION;
  });

  describe("rateLimitIP", () => {
    it("devrait appeler next() pour une requête dans les limites", async () => {
      const middleware = rateLimitIP();
      await middleware(req as Request, res as Response, next);
      expect(consumeMock).toHaveBeenCalledWith("127.0.0.1");
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("devrait renvoyer 429 si la limite de requêtes est dépassée", async () => {
      consumeMock.mockRejectedValue(new Error("Too many requests"));
      const middleware = rateLimitIP();
      await middleware(req as Request, res as Response, next);
      expect(consumeMock).toHaveBeenCalledWith("127.0.0.1");
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({ message: "Trop de requêtes. Réessayez plus tard." });
    });

    it("devrait désactiver le rate limiting si DISABLE_RATE_LIMIT est true", async () => {
      process.env.DISABLE_RATE_LIMIT = "true";
      const middleware = rateLimitIP();
      await middleware(req as Request, res as Response, next);
      expect(RateLimiterMemory).not.toHaveBeenCalled();
      expect(consumeMock).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("devrait utiliser les options personnalisées", async () => {
      const middleware = rateLimitIP({ points: 10, duration: 120 });
      await middleware(req as Request, res as Response, next);
      expect(RateLimiterMemory).toHaveBeenCalledWith({ points: 10, duration: 120 });
      expect(next).toHaveBeenCalled();
    });
  });

  describe("rateLimitIPAndEmail", () => {
    it("devrait appeler next() pour une requête dans les limites (IP et Email)", async () => {
      req.body = { email: "test@example.com" };
      const middleware = rateLimitIPAndEmail();
      await middleware(req as Request, res as Response, next);
      expect(consumeMock).toHaveBeenCalledTimes(2); // Once for IP, once for email
      expect(consumeMock).toHaveBeenCalledWith("127.0.0.1");
      expect(consumeMock).toHaveBeenCalledWith("test@example.com");
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("devrait renvoyer 429 si la limite IP est dépassée", async () => {
      consumeMock.mockImplementationOnce(() => Promise.reject(new Error("IP limit")));
      const middleware = rateLimitIPAndEmail();
      await middleware(req as Request, res as Response, next);
      expect(consumeMock).toHaveBeenCalledWith("127.0.0.1");
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(429);
    });

    it("devrait renvoyer 429 si la limite Email est dépassée", async () => {
      req.body = { email: "test@example.com" };
      consumeMock.mockImplementationOnce(() => Promise.resolve()); // IP consume succeeds
      consumeMock.mockImplementationOnce(() => Promise.reject(new Error("Email limit"))); // Email consume fails
      const middleware = rateLimitIPAndEmail();
      await middleware(req as Request, res as Response, next);
      expect(consumeMock).toHaveBeenCalledWith("test@example.com");
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(429);
    });

    it("devrait désactiver le rate limiting si DISABLE_RATE_LIMIT est true", async () => {
      process.env.DISABLE_RATE_LIMIT = "true";
      req.body = { email: "test@example.com" };
      const middleware = rateLimitIPAndEmail();
      await middleware(req as Request, res as Response, next);
      expect(RateLimiterMemory).not.toHaveBeenCalled();
      expect(consumeMock).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("devrait fonctionner sans email dans le corps de la requête", async () => {
      req.body = {}; // No email
      const middleware = rateLimitIPAndEmail();
      await middleware(req as Request, res as Response, next);
      expect(consumeMock).toHaveBeenCalledTimes(1); // Only for IP
      expect(consumeMock).toHaveBeenCalledWith("127.0.0.1");
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("devrait utiliser les options personnalisées", async () => {
      const middleware = rateLimitIPAndEmail({
        ipPoints: 20, ipDuration: 600, emailPoints: 5, emailDuration: 3600, emailField: "userEmail"
      });
      req.body = { userEmail: "custom@example.com" };
      await middleware(req as Request, res as Response, next);
      expect(RateLimiterMemory).toHaveBeenCalledTimes(2);
      expect(RateLimiterMemory).toHaveBeenCalledWith({ points: 20, duration: 600 });
      expect(RateLimiterMemory).toHaveBeenCalledWith({ points: 5, duration: 3600 });
      expect(consumeMock).toHaveBeenCalledWith("custom@example.com");
      expect(next).toHaveBeenCalled();
    });
  });
});
