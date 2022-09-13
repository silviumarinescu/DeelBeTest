const request = require("supertest");
const app = require("../app");
const seed = require("../../scripts/seedDb");

beforeEach(async () => {
  await seed();
});

describe("balances", () => {
  test("invalid input", async () => {
    const rsp = await request(app)
      .post("/balances/deposit/1")
      .send({ amount: "asdasdasdasd" });

    expect(rsp.status).toEqual(400);
    expect(rsp.text).toEqual("Amount not valid !");
  });
  test("deposit 100 dollars", async () => {
    const amount = 100;
    const rsp = await request(app).post("/balances/deposit/1").send({ amount });

    expect(rsp.status).toEqual(200);
    expect(rsp.body.balance).toEqual(1150 + amount);
  });

  test("deposit 101 dollars", async () => {
    const amount = 101;
    const rsp = await request(app).post("/balances/deposit/1").send({ amount });

    expect(rsp.status).toEqual(401);
    expect(rsp.text).toEqual(
      "You can not deposit more than 25% of your total jobs to pay !"
    );
  });
});
