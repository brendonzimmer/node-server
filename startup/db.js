const mongoose = require("mongoose");
const winston = require("winston");
const config = require("config");

mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);
mongoose.set("useCreateIndex", true);

module.exports = function () {
  const db = config.get("db");

  mongoose.connect(db).then(() => winston.info(`Connected to ${db}...`));
};
