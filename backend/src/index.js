import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import config from "../config.js";
import searchnames from "./searchnames.js";
import getcoordinate from "./getcoordinate.js";
import routesearch from "./routesearch.js";
import getfeature from "./getfeature.js";
import getNearestVertex from "./getnearestvertex.js";
import tracker from "./tracker.js";

const app = express();
const jsonParser = bodyParser.json();

app.disable("x-powered-by");
app.use(cors());
app.set("trust proxy", true);
app.listen(config.port, () => {
  console.log(`Listening at http://localhost:${config.port}`);
});
app.use(jsonParser);

app.use(tracker);

/* start API routes */
app.get("/", (req, res) => {
  res.send("Wanderwege API");
});

app.get("/search", searchnames);
app.get("/getcoordinate", getcoordinate);
app.get("/routesearch", routesearch);
app.get("/getfeature", getfeature);
app.get("/getnearestvertex", getNearestVertex);
app.get("/dummy", (req, res) => res.end());

app.all("*", (req, res) => {
  res.status(400).json({ error: true, message: "unknown route" });
});
/* end API routes */
