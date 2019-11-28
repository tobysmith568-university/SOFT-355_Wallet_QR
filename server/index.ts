import * as express from "express";
import Server from "./src/server";
import Config from "./src/config/config";
import { Express } from "express";
import * as dotenv from "dotenv";

dotenv.config();

const app: Express = express();
const config: Config = new Config();

const server = new Server(app, config);
server.initializeMiddlewares();
server.setUpDatabaseConnection();
server.initializeControllers();
server.listen();
