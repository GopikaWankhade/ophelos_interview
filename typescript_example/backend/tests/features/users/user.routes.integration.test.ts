import http from "http";
import app from "../../../src/app";
import { AddressInfo } from "net";
import { PrismaClient } from "../../../generated/prisma_client";

const prisma = new PrismaClient();
let server: http.Server;
let baseURL: string;

beforeAll((done) => {
  server = http.createServer(app).listen(0, () => {
    const { port } = server.address() as AddressInfo;
    baseURL = `http://127.0.0.1:${port}`;
    done();
  });
});

afterAll((done) => {
  server.close(done);
});

describe("POST /api/users", () => {
  it("should return 201 and the created user", async () => {
    const res = await fetch(`${baseURL}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        name: "Test User",
        password: "testing12345",
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        email: "test@example.com",
        name: "Test User",
        createdAt: expect.any(String),
      }),
    );
  });

  it("should return 400 and a json array of errors when name is missing", async () => {
    const res = await fetch(`${baseURL}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "testing12345" }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(Array.isArray(body.errors)).toBe(true);
    expect(body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ["body", "name"],
          message: expect.stringMatching(/Required/),
        }),
      ]),
    );
  });

  it("should return 400 and a json array of errors when email is invalid", async () => {
    const res = await fetch(`${baseURL}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "not-an-email", name: "Test User", password: "testing12345" }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(Array.isArray(body.errors)).toBe(true);
    expect(body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ["body", "email"],
          message: expect.stringMatching(/Invalid email/),
        }),
      ]),
    );
  });
});

describe("GET /api/users/:id", () => {
  it("should return 200 and the user data", async () => {
    const created = await prisma.user.create({
      data: { email: "test@example.com", name: "Test User", password: "testing12345" },
    });
    const res = await fetch(`${baseURL}/api/users/${created.id}`);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(
      expect.objectContaining({
        id: created.id,
        email: created.email,
        name: created.name,
        createdAt: created.createdAt.toISOString(),
      }),
    );
  });

  it("should return 400 and a json error if id is invalid", async () => {
    const res = await fetch(`${baseURL}/api/users/invalid`);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid user ID" });
  });

  it("should return 404 and a json error if id is not found", async () => {
    const res = await fetch(`${baseURL}/api/users/9999`);

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "User not found" });
  });
});
