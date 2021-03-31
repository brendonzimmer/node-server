const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const admin = require("../middleware/admin"); // may not need this?
const { Rental, validate: validateReturn } = require("../models/rental");
const { Movie } = require("../models/movie");
const express = require("express");
const router = express.Router();

// POST ------------------------------------
router.post("/", [auth, validate(validateReturn)], async (req, res) => {
  //   Test for errors ---------------------
  const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

  if (!rental) res.status(404).send("Rental not found.");

  if (rental.dateReturned) res.status(400).send("Return already processed.");

  // All should be valid, proceed ----------
  rental.return();
  await rental.save();

  await Movie.updateOne(
    { _id: rental.movie._id },
    {
      $inc: { numberInStock: 1 },
    }
  );

  return res.send(rental);
});

module.exports = router;
