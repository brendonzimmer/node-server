const auth = require("../middleware/auth");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const { User, validate } = require("../models/user");
const express = require("express");
const router = express.Router();

// GET ------------------------------------
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  res.send(user);
});

// POST ------------------------------------
router.post("/", async (req, res) => {
  //   Test for errors ---------------------
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  // All should be valid, proceed ----------
  // Create new object ---------------------
  user = new User(_.pick(req.body, ["name", "email", "password"]));
  user.password = await bcrypt.hash(user.password, 10);
  await user.save();

  const token = user.generateAuthToken();
  res
    .header("X-Auth-Token", token)
    .send(_.pick(user, ["_id", "name", "email"]));
});

// PUT -------------------------------------

// DELETE ----------------------------------

module.exports = router;
