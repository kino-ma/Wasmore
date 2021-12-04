const app = require('./index');
const request = require('supertest');

describe("Test the root path", () => {
  test("It should return ok hello", () =>
    request(app)
      .get("/")
      .then((response) => {
        expect(response.statusCode).toBe(200);
      })
  )
})