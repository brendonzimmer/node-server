require("express-async-errors");
const winston = require("winston");
require("winston-mongodb");
const error = require("./middleware/error");
const config = require("config");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const mongoose = require("mongoose");
const genres = require("./routes/genres");
const customers = require("./routes/customers");
const movies = require("./routes/movies");
const rentals = require("./routes/rentals");
const users = require("./routes/users");
const auth = require("./routes/auth");
const express = require("express");
const app = express();

process.on("unhandledRejection", e => {
  e.message = "unhandledRejection";
  throw e;
});

winston.add(
  new winston.transports.File({
    filename: "logs/general.log",
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.printf(({ level, message, timestamp, metadata }) => {
        return `(${timestamp}) [${level.toUpperCase()}]: "${
          message === "" ? "No message." : message
        }" ---- "${metadata.stack
          .replace(/\n/g, "")
          .substring(metadata.stack.indexOf(" at"))}"`;
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
            .replace("uncaughtException: (no error message)Error", "")}"`;
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

// throw new Error();

// const p = Promise.reject(new Error());
// p.then(() => console.log("Done"));

if (!config.get("jwtPrivateKey")) {
  console.error("FATAL ERROR: jwtPrivateKey is not defined.");
  process.exit(1);
}

mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);
mongoose.set("useCreateIndex", true);

mongoose
  .connect("mongodb://localhost/vidly")
  .then(() => console.log("Connected to MongoDB..."))
  .catch(e => console.log("Error: Could not connect to MongoDB...", e));

const port = process.env.PORT || 5260;
app.listen(port, () => console.log(`Listening on port ${port}...`));

app.use(express.json());
app.use("/api/genres", genres);
app.use("/api/customers", customers);
app.use("/api/movies", movies);
app.use("/api/rentals", rentals);
app.use("/api/users", users);
app.use("/api/auth", auth);

app.use(error);
