const app = require('./index');
const request = require('supertest');

describe("Test the root path", () => {
  test("It should return ok hello", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
  })
})