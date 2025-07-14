import { PrismaClient } from "../generated/prisma_client";

const prisma = new PrismaClient();

beforeEach(async () => {
  // wipe out tables in the correct order
  await prisma.statement.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
