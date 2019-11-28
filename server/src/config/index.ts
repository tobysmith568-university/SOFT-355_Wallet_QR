export const ENV = {
  dev: "dev",
  prod: "prod",
  test: "test"
};

let config = {
  environment: process.env.NODE_ENV || ENV.dev,
  port: process.env.PORT || 3000
};

config = { ...config, ...require(`./${config.environment}`).config };

export default config;
