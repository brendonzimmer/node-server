const request = require("supertest");
const { Rental } = require("../../../models/rental");
const { User } = require("../../../models/user");
const { Movie } = require("../../../models/movie");
const moment = require("moment");
const mongoose = require("mongoose");
let server;

// POST /api/returns {customerId, movieId}
describe("/api/returns", () => {
  let rental;
  let movie;
  let customerId;
  let movieId;
  let token;

  const exec = () => {
    return request(server)
      .post("/api/returns")
      .set("X-Auth-Token", token)
      .send({ customerId, movieId });
  };

  beforeEach(async () => {
    server = require("../../../index");

    token = new User({ isAdmin: false }).generateAuthToken();

    customerId = mongoose.Types.ObjectId();
    movieId = mongoose.Types.ObjectId();

    movie = new Movie({
      _id: movieId,
      title: "A",
      dailyRentalRate: 1,
      genre: { name: "123" },
      numberInStock: 10,
    });
    await movie.save();

    rental = new Rental({
      customer: {
        _id: customerId,
        name: "A",
        phone: 123456,
      },
      movie: {
        _id: movieId,
        title: "A",
        dailyRentalRate: 1,
      },
    });
    await rental.save();
  });

  afterEach(async () => {
    await server.close();
    await Rental.remove({}); // Deprecation warning
    await Movie.remove({}); // Deprecation warning
  });

  // return 401 if client is not logged in
  it("should return 401 if client is not logged in", async () => {
    token = "";

    const res = await exec();

    expect(res.status).toBe(401);
  });

  // return 400 if customerId is not provided
  it("should return 400 if customerId is not provided", async () => {
    customerId = "";

    const res = await exec();

    expect(res.status).toBe(400);
  });

  // return 400 if movieId is not provided
  it("should return 400 if movieId is not provided", async () => {
    movieId = "";

    const res = await exec();

    expect(res.status).toBe(400);
  });

  // return 404 if rental is not found given customer and movie
  it("should return 404 if rental is not found given customer and movie", async () => {
    await Rental.remove({}); // Deprecation warning

    const res = await exec();

    expect(res.status).toBe(404);
  });

  // return 400 if rental already processed
  it("should return 400 if return is already processed", async () => {
    rental.dateReturned = new Date();
    await rental.save();

    const res = await exec();

    expect(res.status).toBe(400);
  });

  // return 200 if valid request
  it("should return 200 if rental return is a valid request", async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });

  // set the return date
  it("should set the return date if input is valid", async () => {
    await exec();

    const rentalInDb = await Rental.findById(rental._id);
    const diff = new Date() - rentalInDb.dateReturned;
    expect(diff).toBeLessThan(10 * 1000);
  });

  // calculatre rental fee
  it("should set rental fee if input is valid", async () => {
    rental.dateOut = moment().add(-7, "days").toDate();
    await rental.save();

    await exec();

    const rentalInDb = await Rental.findById(rental._id);
    expect(rentalInDb.fee).toBe(7);
  });

  // increase the stock
  it("should increase the stock of the movie", async () => {
    await exec();

    const movieInDb = await Movie.findById(movieId);
    expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
  });

  // return the rental
  it("should return the rental if all is valid", async () => {
    const res = await exec();

    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining([
        "customer",
        "movie",
        "dateOut",
        "dateReturned",
        "fee",
      ])
    );
  });
});
