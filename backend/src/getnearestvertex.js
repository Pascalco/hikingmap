import pkg from "pg";
const { Client: PgClient } = pkg;
import config from "../config.js";

const connectionString = config.connectionString;

const getNearestVertex = (req, res) => {
  if (!req.query.lat || !req.query.lon) {
    res.status(400).json({ error: true });
  } else {
    const pgClient = new PgClient({ connectionString });
    pgClient.connect();
    pgClient
      .query(
        `SELECT id FROM edges_new_vertices_pgr ORDER BY the_geom <-> ST_GeomFromText('POINT(${req.query.lon} ${req.query.lat})', 3857) LIMIT 1;`
      )
      .then(response => {
        res.json({ id: response.rows[0].id });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ error: true });
      })
      .then(() => pgClient.end());
  }
};

export default getNearestVertex;
