import pkg from "pg";
const { Client: PgClient } = pkg;
import config from "../config.js";

const connectionString = config.connectionString;

const searchnames = (req, res) => {
  if (!req.query.q || req.query.q == "") {
    res.json([]);
  } else {
    const pgClient = new PgClient({ connectionString });
    pgClient.connect();
    pgClient
      .query(
        `SELECT id, edge_vertex_id AS vertexid, name, municipality, canton, type FROM names_new WHERE name ILIKE '${req.query.q}%' ORDER BY name COLLATE "de-CH-x-icu" LIMIT 10`
      )
      .then(response => {
        res.json(response.rows);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ error: true });
      })
      .then(() => pgClient.end());
  }
};

export default searchnames;
