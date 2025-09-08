import { sendMail, buildTransport } from "../../services/email.service";
import nodemailer from "nodemailer";

jest.mock("nodemailer"); // Mock nodemailer itself

describe("Email Service", () => {
  let mockTransporter: any; // Use 'any' for simplicity in mocking complex objects

  beforeEach(() => {
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: "mock-message-id" }),
    };
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    // Clear environment variables before each test
    delete process.env.NODE_ENV;
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_SECURE;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.SMTP_FROM;
  });

  describe("sendMail", () => {
    it("devrait envoyer un email en mode développement (jsonTransport)", async () => {
      process.env.NODE_ENV = "development";
      const emailOptions = {
        to: "test@example.com",
        subject: "Test Subject",
        text: "Test Text",
        html: "<p>Test HTML</p>",
      };

      const info = await sendMail(emailOptions);

      expect(nodemailer.createTransport).toHaveBeenCalledWith({ jsonTransport: true });
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: "no-reply@edifis-pro.local",
        to: emailOptions.to,
        subject: emailOptions.subject,
        text: emailOptions.text,
        html: emailOptions.html,
      });
      expect(info).toEqual({ messageId: "mock-message-id" });
    });

    it("devrait envoyer un email en mode production (SMTP)", async () => {
      process.env.NODE_ENV = "production";
      process.env.SMTP_HOST = "smtp.example.com";
      process.env.SMTP_PORT = "465";
      process.env.SMTP_SECURE = "true";
      process.env.SMTP_USER = "user";
      process.env.SMTP_PASS = "pass";
      process.env.SMTP_FROM = "prod@example.com";

      const emailOptions = {
        to: "prod@example.com",
        subject: "Prod Subject",
        text: "Prod Text",
        html: "<p>Prod HTML</p>",
      };

      const info = await sendMail(emailOptions);

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: "smtp.example.com",
        port: 465,
        secure: true,
        auth: { user: "user", pass: "pass" },
      });
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: "prod@example.com",
        to: emailOptions.to,
        subject: emailOptions.subject,
        text: emailOptions.text,
        html: emailOptions.html,
      });
      expect(info).toEqual({ messageId: "mock-message-id" });
    });

    it("devrait utiliser jsonTransport en production si les variables SMTP sont manquantes", async () => {
      process.env.NODE_ENV = "production";
      // Missing SMTP_HOST, SMTP_USER, SMTP_PASS

      const emailOptions = {
        to: "fallback@example.com",
        subject: "Fallback Subject",
        text: "Fallback Text",
        html: "<p>Fallback HTML</p>",
      };

      const info = await sendMail(emailOptions);

      expect(nodemailer.createTransport).toHaveBeenCalledWith({ jsonTransport: true });
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: "no-reply@edifis-pro.local",
        to: emailOptions.to,
        subject: emailOptions.subject,
        text: emailOptions.text,
        html: emailOptions.html,
      });
      expect(info).toEqual({ messageId: "mock-message-id" });
    });

    it("devrait utiliser le FROM par défaut si SMTP_FROM n'est pas défini", async () => {
      process.env.NODE_ENV = "production";
      process.env.SMTP_HOST = "smtp.example.com";
      process.env.SMTP_PORT = "465";
      process.env.SMTP_SECURE = "true";
      process.env.SMTP_USER = "user";
      process.env.SMTP_PASS = "pass";
      // SMTP_FROM is missing

      const emailOptions = {
        to: "defaultfrom@example.com",
        subject: "Default From Subject",
        text: "Default From Text",
        html: "<p>Default From HTML</p>",
      };

      const info = await sendMail(emailOptions);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: "no-reply@edifis-pro.local", // Default FROM
        to: emailOptions.to,
        subject: emailOptions.subject,
        text: emailOptions.text,
        html: emailOptions.html,
      });
      expect(info).toEqual({ messageId: "mock-message-id" });
    });
  });
});