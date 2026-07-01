const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");

// Prevent actual DB connections during simple health test if preferred
// But typically supertest will start the app. 

describe("Health Check API", () => {
  it("should return status UP on /api/v1/health", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("UP");
    expect(res.body).toHaveProperty("timestamp");
  });

  afterAll(async () => {
    // Close mongoose connection to prevent jest open handles
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  });
});
