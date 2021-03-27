const winston = require("winston");
require("winston-mongodb");
require("express-async-errors");

module.exports = function () {
  process.on("unhandledRejection", e => {
    e.message = "unhandledRejection";
    throw e;
  });

  winston.add(
    new winston.transports.Console({
      handleExceptions: true,
      format: winston.format.combine(
        winston.format.timestamp({ format: "(M-D H:m:s) " }), // Not showing timestap at the moment
        winston.format.printf(({ level, message, timestamp, metadata }) => {
          return /*${timestamp}*/ `[${level.toUpperCase()}]: ${
            message === "" ? "No message." : message
          }${
            metadata
              ? " ---- " +
                metadata.stack.substring(metadata.stack.indexOf(" at"))
              : ""
          }`;
        })
      ),
    })
  ); // CONSOLE LOG
  winston.add(
    new winston.transports.File({
      filename: "logs/general.log",
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(({ level, message, timestamp, metadata }) => {
          return `(${timestamp}) [${level.toUpperCase()}]: "${
            message === "" ? "No message." : message
          }"${
            metadata
              ? ' ---- "' +
                metadata.stack
                  .replace(/\n/g, "")
                  .substring(metadata.stack.indexOf(" at")) +
                '"'
              : ""
          }`;
        })
      ),
    })
  ); // LOG FILE
  winston.add(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      handleExceptions: true,
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(({ message, timestamp, metadata }) => {
          if (!metadata) {
            return `(${timestamp}) ${
              message.includes("unhandledRejection")
                ? "[UNHANDLED REJECTION"
                : message.includes("uncaughtException")
                ? " [UNCAUGHT EXCEPTION"
                : message
            }]: "${message
              .replace(/\n/g, "")
              .replace("    ", "")
              .replace(
                "uncaughtException: unhandledRejectionError: unhandledRejection",
                ""
              )
              .replace("uncaughtException: unhandledRejectionTypeError: ", "")
              .replace("uncaughtException: (no error message)Error", "")
              .replace("uncaughtException: ", "")}"`;
          }

          return `(${timestamp}) ${"              [ERROR"}]: "${
            metadata.stack.startsWith("Error")
              ? (
                  metadata.stack.slice(0, 1 + metadata.stack.indexOf(" ")) +
                  "— No message." +
                  metadata.stack.slice(metadata.stack.indexOf("    "))
                ).replace(/\n/g, "")
              : metadata.stack.replace(/\n/g, "")
          }"`;
        })
      ),
    })
  ); // ERROR LOG FILE
  winston.add(
    new winston.transports.MongoDB({
      db: "mongodb://localhost/vidly",
      level: "info",
      options: { useUnifiedTopology: true },
    })
  ); // DATABASE LOG FILE
};
