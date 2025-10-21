import { appRouter } from "../../src/server/trpc";

export async function getHealthStatus() {
  const health = await appRouter.createCaller({}).health();
  return health;
}
