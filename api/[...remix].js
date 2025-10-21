const { createRequestHandler } = require("@remix-run/node");

let build = require("../build/index.js");

module.exports = createRequestHandler({
  build,
  mode: "production",
});