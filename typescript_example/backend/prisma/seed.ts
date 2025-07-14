import { PrismaClient } from "../generated/prisma_client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("testpassword", 10);
  // Upsert test user
  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      name: "Test User",
      password,
    },
  });

  // Upsert a statement for the test user
  await prisma.statement.upsert({
    where: { id: 1 }, // or use a unique name if you have a unique constraint
    update: {},
    create: {
      name: "Test Statement",
      userId: user.id,
    },
  });

  console.log("Test user and statement seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
