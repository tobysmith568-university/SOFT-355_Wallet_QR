import app from "./src/app";
import config, { ENV } from "./src/config";
import { join } from "path";
import * as express from "express";

if (config.environment === ENV.prod) {
  app.use(express.static(join(__dirname, "../../../../client/dist")));
}

app.listen(config.port, () => {
  console.log(`server started at port ${config.port}`);
});
