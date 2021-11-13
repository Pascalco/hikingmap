import pkg from "pg";
const { Client: PgClient } = pkg;
import config from "../config.js";

const connectionString = config.connectionString;

const tracker = (req, res, next) => {
  const pgClient = new PgClient({ connectionString });
  pgClient.connect();
  pgClient
    .query("INSERT INTO tracker (ip, useragent, language, url, timestamp) VALUES ($1, $2, $3, $4, current_timestamp)", [
      req.ip,
      req.headers["user-agent"],
      req.headers["accept-language"],
      req.originalUrl,
    ])
    .then(() => pgClient.end())
    .catch(err => {
      console.log(err);
      pgClient.end();
    });
  next();
};

export default tracker;
