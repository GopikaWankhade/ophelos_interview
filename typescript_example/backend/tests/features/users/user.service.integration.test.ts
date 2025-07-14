import { PrismaClient, User } from "../../../generated/prisma_client";
import { createUser, getUserById } from "../../../src/features/users/user.service";

const prisma = new PrismaClient();

describe("user.service (integration)", () => {
  const data = { email: "test@example.com", name: "Test User", password: "testing12345" };
  describe("createUser", () => {
    it("persists a user into the database and fetch the same created user", async () => {
      const createdUser = await createUser(data);

      expect(createdUser.id).toBeGreaterThan(0);
      expect(createdUser.name).toBe(data.name);
      expect(createdUser.email).toBe(data.email);
      expect(createdUser.createdAt).toBeInstanceOf(Date);
    });
  });

  describe("getUserById", () => {
    it("returns null for a non-existent user id", async () => {
      const result = await getUserById(99999);
      expect(result).toBeNull();
    });

    it("fetches a persisted user", async () => {
      const createdUser = await prisma.user.create({ data });

      const fetchedUser = await getUserById(createdUser.id);

      expect(fetchedUser as User).toMatchObject({
        id: createdUser.id,
        email: data.email,
        name: data.name,
        createdAt: createdUser.createdAt,
      });
    });
  });
});
