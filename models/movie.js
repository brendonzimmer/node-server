const { genreSchema } = require("./genre");
const mongoose = require("mongoose");
const Joi = require("joi");

const Movie = mongoose.model(
  "Movie",
  new mongoose.Schema({
    title: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 255,
      trim: true,
    },
    genre: {
      type: genreSchema,
      required: true,
    },
    numberInStock: {
      type: Number,
      required: true,
      min: 0,
      max: 150,
    },
    dailyRentalRate: {
      type: Number,
      required: true,
      min: 0,
      max: 50,
    },
  })
);

const validateMovie = body => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(255).required(),
    genreId: Joi.objectId().required(),
    numberInStock: Joi.number().min(0).max(150).required(),
    dailyRentalRate: Joi.number().greater(0).max(50).required(),
  });

  return schema.validate(body);
};

exports.Movie = Movie;
exports.validate = validateMovie;
