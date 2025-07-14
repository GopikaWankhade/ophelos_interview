import { execSync } from "child_process";
import { GenericContainer } from "testcontainers";

export default async function globalSetup() {
  const container = await new GenericContainer("postgres:15")
    .withEnvironment({
      POSTGRES_USER: "test",
      POSTGRES_PASSWORD: "test",
      POSTGRES_DB: "testDb",
    })
    .withExposedPorts(5432)
    .start();

  const host = container.getHost();
  const port = container.getMappedPort(5432);
  process.env.DATABASE_URL = `postgresql://test:test@${host}:${port}/testdb?schema=public`;

  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: process.env,
  });

  // @ts-expect-error Adding test-container to global for setup
  global.__PG_CONTAINER__ = container;
}
