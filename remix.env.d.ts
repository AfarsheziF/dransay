/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      JWT_SECRET: string;
      NODE_ENV: "development" | "production" | "test";
    }
  }
}
