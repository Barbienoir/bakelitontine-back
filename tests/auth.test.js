process.env.NODE_ENV = "test";

jest.mock("../config/cloudinary.js", () => ({
  cloudinary: {},
  uploadAvatar: { single: () => (req, res, next) => next() },
  uploadPreuve: { single: () => (req, res, next) => next() },
}));

jest.mock("../services/stripeService.js");
jest.mock("../services/mailService.js");
jest.mock("../services/waveService.js");

const request = require("supertest");
const app = require("../server.js");
const mongoose = require("mongoose");

// Nettoyer la base après les tests
afterAll(async () => {
  await mongoose.connection.db.collection("users").deleteMany({ email: "test@mail.com" });
  await mongoose.connection.close();
});

describe("Auth API", () => {
  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        prenom: "Test",
        nom: "User",
        email: "test@mail.com",
        telephone: "771234567",
        password: "123456",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
  });

  it("should not register same email twice", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        prenom: "Test",
        nom: "User",
        email: "test@mail.com",
        telephone: "771234567",
        password: "123456",
      });
    expect(res.statusCode).toBe(400);
  });

  it("should login an existing user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ identifier: "test@mail.com", password: "123456" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("should return 401 with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ identifier: "test@mail.com", password: "mauvais" });
    expect(res.statusCode).toBe(401);
  });
});