const Joi = require("joi");
const bcrypt = require("bcrypt");
// const _ = require("lodash");
const { User } = require("../models/user");
const express = require("express");
const router = express.Router();

// POST ------------------------------------
router.post("/", async (req, res) => {
  //   Test for errors ---------------------
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password.");

  // All should be valid, proceed ----------
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password.");

  const token = user.generateAuthToken(); // DONT STORE PRIVATE KEY IN CODE

  res.send(token);
});

// METHODS ---------------------------------
const validate = body => {
  const schema = Joi.object({
    email: Joi.string().email().min(6).max(255).required(), //  Make sure email is unique
    password: Joi.string().min(6).max(255).required(), //  npm i joi-password-complexity
  });

  return schema.validate(body);
};

module.exports = router;
