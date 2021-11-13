import pkg from "pg";
const { Client: PgClient } = pkg;
import config from "../config.js";

const connectionString = config.connectionString;

const getcoordinate = (req, res) => {
  if (!req.query.id || req.query.id == "") {
    res.json({ e: null, n: null });
  } else {
    const pgClient = new PgClient({ connectionString });
    pgClient.connect();
    pgClient
      .query(`SELECT ST_X(coord) as e, ST_Y(coord) as n FROM names_new WHERE id = '${req.query.id}'`)
      .then(response => {
        res.json(response.rows[0]);
      })
      .catch(err => {
        res.status(500).json({ error: true });
      })
      .then(() => pgClient.end());
  }
};

export default getcoordinate;
