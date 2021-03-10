const Joi = require("joi");
const mongoose = require("mongoose");

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
    trim: true,
  },
});

const Genre = mongoose.model("Genre", genreSchema);

const validateGenre = body => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
  });

  return schema.validate(body);
};

exports.Genre = Genre;
exports.validate = validateGenre;
exports.genreSchema = genreSchema;
