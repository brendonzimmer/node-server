const winston = require("winston");

module.exports = function (e, req, res, next) {
  // Logging exeptions in express
  winston.error(e.message, { metadata: e });
  // Notifying client
  res.status(500).send("Something failed.");
};
