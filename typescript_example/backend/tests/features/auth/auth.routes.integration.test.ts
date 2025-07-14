import { PrismaClient } from "../../../generated/prisma_client";
import http from "http";
import app from "../../../src/app";
import { AddressInfo } from "net";
import { signUp } from "../../../src/features/auth/auth.service";

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

describe("POST /api/auth/signup", () => {
  it("should return 201 and the created user", async () => {
    const res = await fetch(`${baseURL}/api/auth/signup`, {
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
});

describe("POST /api/auth/login", () => {
  it("should return 201 and the created user", async () => {
    await signUp({
      body: { email: "test@example.com", name: "Test User", password: "testing12345" },
    });

    const res = await fetch(`${baseURL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "testing12345" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(
      expect.objectContaining({
        user: {
          id: expect.any(Number),
          email: "test@example.com",
          name: "Test User",
          createdAt: expect.any(String),
        },
        token: expect.any(String),
      }),
    );
  });
});
