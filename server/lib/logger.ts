import winston from "winston";

/**
 * Configuration for the logger. Using Winston as a logging library.
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: "ai-agent-generator" },
  transports: [
    // Write all logs with level 'error' and below to 'error.log'
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    // Write all logs with level 'info' and below to 'combined.log'
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

// If we're not in production, also log to the console with more readable format
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}

// Create a stream object for Morgan to use
const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export { logger, stream };
