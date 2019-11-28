import * as express from "express";
import helloWorld from "./api/routes/helloWorld.route";
import { bodyParser } from "./middlewares/bodyParser";

const app = express();
app.use(bodyParser(app));
app.use("/api", helloWorld);

export default app;
