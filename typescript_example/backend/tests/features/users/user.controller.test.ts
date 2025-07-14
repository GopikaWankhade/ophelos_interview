import { Request, Response } from "express";
import * as userService from "../../../src/features/users/user.service";
import { createUserHandler, getUserHandler } from "../../../src/features/users/user.controller";

jest.mock("../../../src/features/users/user.service");

describe("createUserHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a user and return 201 alongside the json representation of the User", async () => {
    expect.assertions(3);

    const testUser = { id: 1, email: "test@example.com", name: "Test User" };
    const res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;
    const req = {
      body: { email: testUser.email, name: testUser.name },
    } as Request;

    (userService.createUser as jest.Mock).mockResolvedValue(testUser);

    await createUserHandler(req, res);

    expect(userService.createUser).toHaveBeenCalledWith({
      email: "test@example.com",
      name: "Test User",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(testUser);
  });

  it("should catch any errors and return 400 with the adequate error message", async () => {
    expect.assertions(2);

    const testUser = { id: 1, email: "test@example.com", name: "Test User" };
    const error = new Error("Gateway Timeout");
    const res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;
    const req = {
      body: { email: testUser.email, name: testUser.name },
    } as Request;

    (userService.createUser as jest.Mock).mockRejectedValue(error);

    await createUserHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: error.message });
  });
});

describe("getUserHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return user if found", async () => {
    expect.assertions(2);

    const testUser = { id: 1, email: "test@example.com", name: "Test User" };
    const res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;
    const req = {
      params: { id: "1" },
    } as Request<{ id: string }>;

    (userService.getUserById as jest.Mock).mockResolvedValue(testUser);

    await getUserHandler(req, res);

    expect(userService.getUserById).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(testUser);
  });

  it("should return 404 if user not found", async () => {
    expect.assertions(2);

    const res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;
    const req = {
      params: { id: "1" },
    } as Request<{ id: string }>;

    (userService.getUserById as jest.Mock).mockResolvedValue(null);

    await getUserHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
  });

  it("should return 400 if user id is invalid", async () => {
    expect.assertions(3);

    const res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    } as unknown as Response;
    const req = {
      params: { id: "ff" },
    } as Request<{ id: string }>;

    await getUserHandler(req, res);

    expect(userService.getUserById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid user ID" });
  });
});
