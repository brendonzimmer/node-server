const mongoose = require("mongoose");
const Joi = require("joi");

const Customer = mongoose.model(
  "Customer",
  new mongoose.Schema({
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
  })
);

const validateCustomer = body => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(25).required(),
    phone: Joi.number().min(10).max(20).required(),
    gold: Joi.boolean(),
  });

  return schema.validate(body);
};

exports.Customer = Customer;
exports.validate = validateCustomer;
