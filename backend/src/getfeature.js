import pkg from "pg";
const { Client: PgClient } = pkg;
import config from "../config.js";

const connectionString = config.connectionString;

const getfeature = (req, res) => {
  console.log(req.query.id);
  if (!req.query.id || req.query.id == "") {
    res.json({ e: null, n: null });
  } else {
    const pgClient = new PgClient({ connectionString });
    pgClient.connect();
    pgClient
      .query(`SELECT layer, sublayer, metadata FROM map_points WHERE id = '${req.query.id}'`)
      .then(response => {
        let metadataString = "{}";
        if (response.rows[0] && response.rows[0].metadata) {
          metadataString = response.rows[0].metadata;
        }
        const metadata = JSON.parse(metadataString);
        res.json({ layer: response.rows[0].layer, sublayer: response.rows[0].sublayer, metadata: metadata });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ error: true });
      })
      .then(() => pgClient.end());
  }
};

export default getfeature;
