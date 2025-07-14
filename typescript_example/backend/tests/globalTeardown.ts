export default async function globalTeardown() {
  // @ts-expect-error Retrieving test-container from global for teardown
  const container = global.__PG_CONTAINER__;
  if (container) {
    await container.stop();
  }
}
