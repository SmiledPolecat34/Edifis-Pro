const nodemailer = require("nodemailer");

/**
 * Service d&#39;envoi d&#39;emails.
 * - En dev: transport JSON (log en console, pas d&#39;envoi réel)
 * - En prod: utiliser SMTP via variables d&#39;environnement
 *   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM
 */

function buildTransport() {
    if (process.env.NODE_ENV !== "production") {
        return nodemailer.createTransport({ jsonTransport: true });
    }
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const secure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        // Fallback sécurisé si SMTP non configuré en prod
        return nodemailer.createTransport({ jsonTransport: true });
    }

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
    });
}

const transporter = buildTransport();

async function sendMail({ to, subject, text, html }) {
    const from = process.env.SMTP_FROM || "no-reply@edifis-pro.local";
    const info = await transporter.sendMail({ from, to, subject, text, html });
    if (process.env.NODE_ENV !== "production") {
        // Affiche le contenu (jsonTransport) dans la console
        // eslint-disable-next-line no-console
        console.log("[Email dev]", JSON.stringify(info, null, 2));
    }
    return info;
}

module.exports = { sendMail };
