const mongoose = require("mongoose");
const Joi = require("joi");

const Rental = mongoose.model(
  "Rental",
  new mongoose.Schema({
    customer: {
      type: new mongoose.Schema({
        name: {
          type: String,
          required: true,
          minlength: 1,
          maxlength: 25,
          trim: true,
        },
        phone: {
          type: Number,
          min: 10,
          max: 20,
          required: true,
        },
        gold: {
          type: Boolean,
          default: false,
        },
      }),
      required: true,
    },
    movie: {
      type: new mongoose.Schema({
        title: {
          type: String,
          required: true,
          minlength: 1,
          maxlength: 255,
          trim: true,
        },
        dailyRentalRate: {
          type: Number,
          required: true,
          min: 0,
          max: 50,
        },
      }),
      required: true,
    },
    dateOut: {
      type: Date,
      default: Date.now,
      required: true,
    },
    dateReturned: {
      type: Date,
    },
    fee: {
      type: Number,
      min: 0,
    },
  })
);

function validateRental(body) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
  });
  return schema.validate(body);
}

exports.Rental = Rental;
exports.validate = validateRental;
