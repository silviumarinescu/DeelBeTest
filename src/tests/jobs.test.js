const request = require("supertest");
const app = require("../app");
const seed = require("../../scripts/seedDb");

beforeEach(async () => {
  await seed();
});

describe("jobs", () => {
  test("get unpaid jobs for Harry Potter", async () => {
    const rsp = await request(app).get("/jobs/unpaid").set("profile_id", 1);
    expect(rsp.status).toEqual(200);
    expect(rsp.body.length).toEqual(1);
    expect(rsp.body[0].paid).toEqual(null);
    expect(rsp.body[0].Contract.status).toEqual("in_progress");
  });

  test("get unpaid jobs for John Lenon", async () => {
    const rsp = await request(app).get("/jobs/unpaid").set("profile_id", 5);
    expect(rsp.status).toEqual(200);
    expect(rsp.body.length).toEqual(0);
  });

  test("pay for a job", async () => {
    //Harry Potter (balance: $1150) pays John Lenon(balance: $64) for job 1 the, sum of $200
    const rsp = await request(app).post("/jobs/1/pay").set("profile_id", 1);
    expect(rsp.status).toEqual(200);
    expect(rsp.status).toEqual(200);
    expect(rsp.body.paid).toEqual(true);
    expect(rsp.body.Contract.Client.balance).toEqual(950); // 1150 - 200
    expect(rsp.body.Contract.Contractor.balance).toEqual(264); // 64 + 200
  });

  test("try paying for a job that has already been payed for", async () => {
    const rsp = await request(app).post("/jobs/7/pay").set("profile_id", 4);
    expect(rsp.status).toEqual(404);
  });

  test("try paying for a job with insuficient funds", async () => {
    const rsp = await request(app).post("/jobs/5/pay").set("profile_id", 4);
    expect(rsp.status).toEqual(401);
    expect(rsp.text).toEqual("Insuficient funds !");
  });

  test("try paying for a job you are not a customer of", async () => {
    const rsp = await request(app).post("/jobs/1/pay").set("profile_id", 2);
    expect(rsp.status).toEqual(404);
  });


  test("try paying for a job as the contractor", async () => {
    const rsp = await request(app).post("/jobs/1/pay").set("profile_id", 5);
    expect(rsp.status).toEqual(401);
    expect(rsp.text).toEqual("Only clients can make payments !");
  });
});
