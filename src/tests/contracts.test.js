const request = require("supertest");
const app = require("../app");
const seed = require("../../scripts/seedDb");

beforeEach(async () => {
  await seed();
});

describe("contracts", () => {
  test("read a contract without auth", async () => {
    const rsp = await request(app).get("/contracts/1");
    expect(rsp.status).toEqual(401);
  });
  test("read a contract with correct auth", async () => {
    const rsp = await request(app).get("/contracts/1").set("profile_id", 1);
    expect(rsp.status).toEqual(200);
    expect(rsp.body.id).toEqual(1);
    expect(rsp.body.status).toEqual("terminated");
    expect(rsp.body.ContractorId).toEqual(5);
    expect(rsp.body.ClientId).toEqual(1);
  });
  test("read a contract with incorrect auth", async () => {
    const rsp = await request(app).get("/contracts/1").set("profile_id", 2);
    expect(rsp.status).toEqual(404);
  });
  test("read a contract that does not exist", async () => {
    const rsp = await request(app).get("/contracts/100").set("profile_id", 1);
    expect(rsp.status).toEqual(404);
  });

  test("read contracts that belong to Harry Potter", async () => {
    const rsp = await request(app).get("/contracts").set("profile_id", 1);
    expect(rsp.status).toEqual(200);
    expect(rsp.body.length).toEqual(1);
    expect(rsp.body[0].ClientId).toEqual(1);
    expect(rsp.body[0].status).toEqual("in_progress");
  });

  test("read contracts that belong to John Lenon", async () => {
    const rsp = await request(app).get("/contracts").set("profile_id", 5);
    expect(rsp.status).toEqual(200);
    expect(rsp.body.length).toEqual(0);
  });

  test("read contracts that belong to Aragorn II Elessar Telcontarvalds", async () => {
    const rsp = await request(app).get("/contracts").set("profile_id", 8);
    expect(rsp.status).toEqual(200);
    expect(rsp.body.length).toEqual(2);
  });
});
