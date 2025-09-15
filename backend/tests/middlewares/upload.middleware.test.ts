import { Request, Response, NextFunction } from "express";
import { setUploadType } from "../../middlewares/upload.middleware";
import multer from 'multer';

// Mock multer's internal fileFilter function
const mockFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Format non supporté (Uniquement des images)"), false);
  }
};

describe("Upload Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {};
    next = jest.fn();
  });

  describe("setUploadType", () => {
    it("devrait définir req.uploadType à 'profile'", () => {
      const middleware = setUploadType("profile");
      middleware(req as Request, res as Response, next);
      expect(req.uploadType).toBe("profile");
      expect(next).toHaveBeenCalled();
    });

    it("devrait définir req.uploadType à 'construction'", () => {
      const middleware = setUploadType("construction");
      middleware(req as Request, res as Response, next);
      expect(req.uploadType).toBe("construction");
      expect(next).toHaveBeenCalled();
    });
  });

  describe("fileFilter", () => {
    let cb: jest.Mock;

    beforeEach(() => {
      cb = jest.fn();
    });

    it("devrait accepter un fichier image", () => {
      const file = { mimetype: "image/jpeg" } as Express.Multer.File;
      mockFileFilter(req as Request, file, cb);
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it("devrait rejeter un fichier non-image", () => {
      const file = { mimetype: "application/pdf" } as Express.Multer.File;
      mockFileFilter(req as Request, file, cb);
      expect(cb).toHaveBeenCalledWith(new Error("Format non supporté (Uniquement des images)"), false);
    });
  });
});
