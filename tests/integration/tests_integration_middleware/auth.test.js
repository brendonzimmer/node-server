const request = require("supertest");
const { Genre } = require("../../../models/genre");
const { User } = require("../../../models/user");

describe("auth middleware", () => {
  beforeEach(() => {
    server = require("../../../index");
  });
  afterEach(async () => {
    await server.close();
    await Genre.remove({}); // Deprecation warning
  });

  let token;
  const exec = () => {
    return request(server)
      .post("/api/genres")
      .set("X-Auth-Token", token)
      .send({ name: "genre1" });
  };

  beforeEach(() => {
    token = new User({ isAdmin: true }).generateAuthToken();
  });

  it("should return 401 if no token is provided", async () => {
    token = "";

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it("should return 400 if token is invalid", async () => {
    token = "a";

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 200 if token is valid", async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });
});
