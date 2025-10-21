import { createRequestHandler } from "@remix-run/node";
import * as serverBuild from "./build/index.js";

export default createRequestHandler({
  build: serverBuild,
  mode: process.env.NODE_ENV,
});