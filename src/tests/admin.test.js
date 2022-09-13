const request = require("supertest");
const app = require("../app");
const seed = require("../../scripts/seedDb");

beforeEach(async () => {
  await seed();
});

describe("admin", () => {
  test("profession that earned the most money in total", async () => {
    const rsp = await request(app).get(
      "/admin/best-profession?start=2000-01-01&end=2024-01-01"
    );
    expect(rsp.status).toEqual(200);
    expect(rsp.body.profession).toEqual("Programmer");
  });

  test("profession that earned the most money in bad interval", async () => {
    const rsp = await request(app).get(
      "/admin/best-profession?start=2000-01-01&end=2001-01-01"
    );
    expect(rsp.status).toEqual(401);
    expect(rsp.text).toEqual("No data found in interval !");
  });

  test("clients that paid the most for jobs with no limit", async () => {
    const rsp = await request(app).get(
      "/admin/best-clients?start=2000-01-01&end=2024-01-01"
    );
    expect(rsp.status).toEqual(200);
    expect(rsp.body.length).toEqual(2);
    expect(rsp.body[1].sum).toBeLessThan(rsp.body[0].sum); // check ascending prder
    expect(rsp.body[0].firstName).toEqual("Ash");
  });

    test("clients that paid the most for jobs with limit", async () => {
      const rsp = await request(app).get(
        "/admin/best-clients?start=2000-01-01&end=2024-01-01&limit=3"
      );
      expect(rsp.status).toEqual(200);
      expect(rsp.body.length).toEqual(3);
    });

    test("clients that paid the most for jobs with bad interval", async () => {
      const rsp = await request(app).get(
        "/admin/best-clients?start=2000-01-01&end=2001-01-01"
      );
      expect(rsp.status).toEqual(401);
      expect(rsp.text).toEqual("No data found in interval !");
    });
});
