const path = require("path");
const fs = require("fs");
const { createLogger, format, transports } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");

const logsDir = path.resolve(__dirname, "../..", "logs");
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const isProd = process.env.NODE_ENV === "production";

const logger = createLogger({
    level: process.env.LOG_LEVEL || (isProd ? "info" : "debug"),
    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
    ),
    defaultMeta: { service: "edifis-pro-backend" },
    transports: [
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.printf(({ level, message, timestamp, stack, ...meta }) => {
                    const base = `${timestamp} [${level}] ${message}`;
                    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
                    return stack ? `${base}\n${stack}${metaStr}` : `${base}${metaStr}`;
                })
            ),
        }),
        new DailyRotateFile({
            filename: "app-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            dirname: logsDir,
            maxFiles: "14d",
            maxSize: "20m",
            zippedArchive: true,
            level: "info",
        }),
        new DailyRotateFile({
            filename: "error-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            dirname: logsDir,
            maxFiles: "30d",
            maxSize: "20m",
            zippedArchive: true,
            level: "error",
        }),
    ],
});

// Morgan stream bridge
logger.stream = {
    write: (message) => {
        // message already includes newline
        logger.http ? logger.http(message.trim()) : logger.info(message.trim(), { http: true });
    },
};

module.exports = logger;
