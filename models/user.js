const config = require("config");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Joi = require("joi");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 55,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 1024,
  },
  isAdmin: Boolean,
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    config.get("jwtPrivateKey")
  );
};

const User = mongoose.model("User", userSchema);

const validateUser = body => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(55).required(),
    email: Joi.string().email().min(6).max(255).required(), //  Make sure email is unique
    password: Joi.string().min(6).max(255).required(), //  npm i joi-password-complexity
  });

  return schema.validate(body);
};

exports.User = User;
exports.validate = validateUser;
