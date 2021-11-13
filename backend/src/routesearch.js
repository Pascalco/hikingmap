import pkg from "pg";
import config from "../config.js";

const { Client: PgClient } = pkg;
const connectionString = config.connectionString;

const cumulativeSum = arr => {
  const creds = arr.reduce(
    (acc, val) => {
      let { sum, res } = acc;
      sum += val;
      res.push(sum);
      return { sum, res };
    },
    {
      sum: 0,
      res: [],
    }
  );
  return creds.res;
};

const getHeightChange = vals => {
  let up = 0;
  let down = 0;
  for (let idx in vals) {
    if (idx > 0) {
      let diff = vals[idx] - vals[idx - 1];
      if (diff > 0) {
        up += diff;
      } else {
        down -= diff;
      }
    }
  }
  return { up, down };
};

const parsePostgisString = val => {
  if (val.includes("POINT")) {
    const geomString = val.replace("POINT(", "").replace(")", "");
    const coord = geomString.split(" ").map(n => parseFloat(n));
    return coord;
  } else if (val.includes("LINESTRING")) {
    const geomString = val.replace("LINESTRING(", "").replace(")", "");
    const coordsString = geomString.split(",");
    const coords = coordsString.map(m => m.split(" ").map(n => parseFloat(n)));
    return coords;
  }
  return 0;
};

const getGeojson = geoms => {
  let result = { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } };
  for (let geom of geoms) {
    const coords = parsePostgisString(geom);
    result.geometry.coordinates.push(...coords);
  }
  return JSON.stringify(result);
};

const getVertexData = (nodes, stops) => {
  return new Promise((resolve, reject) => {
    const pgClient = new PgClient({ connectionString });
    pgClient.connect();
    const prom1 = pgClient.query(
      `SELECT id, height, ST_AsText(the_geom) AS geom FROM edges_new_vertices_pgr WHERE id IN (${nodes.join(",")})`
    );
    prom1
      .then(data => {
        let accumulator = {};
        for (let index = 0; index < data.rows.length; index++) {
          accumulator[data.rows[index].id] = data.rows[index];
        }
        const height_y = nodes.map(id => accumulator[id].height);
        const points = stops.map(id => parsePostgisString(accumulator[id].geom));
        resolve({ height_y, points });
      })
      .catch(err => {
        reject(err);
      })
      .then(() => pgClient.end());
  });
};

const getDistance = distancesRaw => {
  let distances = distancesRaw.map(item => item / 1000);
  distances.unshift(0);
  distances = cumulativeSum(distances);
  return { height_x: distances, distance: distances[distances.length - 1] * 1000 };
};

const getWayProperties = edges => {
  return new Promise((resolve, reject) => {
    const pgClient = new PgClient({ connectionString });
    pgClient.connect();
    const prom1 = pgClient.query(
      `SELECT belagsart AS class, sum(ST_Length(ST_Transform(geom, 2056))) AS value FROM edges_new WHERE id IN (${edges.join(
        ","
      )}) GROUP BY belagsart ORDER BY value`
    );
    const prom2 = pgClient.query(
      `SELECT wanderwege AS class, sum(ST_Length(ST_Transform(geom, 2056))) AS value FROM edges_new WHERE id IN (${edges.join(
        ","
      )}) GROUP BY wanderwege ORDER BY value`
    );
    const prom3 = pgClient.query(
      `SELECT objektart AS class, sum(ST_Length(ST_Transform(geom, 2056))) AS value FROM edges_new WHERE id IN (${edges.join(
        ","
      )}) GROUP BY objektart ORDER BY value`
    );
    Promise.all([prom1, prom2, prom3])
      .then(data => {
        resolve({ surface: data[0].rows, rating: data[1].rows, size: data[2].rows });
      })
      .catch(err => {
        reject(err);
      })
      .then(() => pgClient.end());
  });
};

const getRoute = (startid, endid) => {
  return new Promise((resolve, reject) => {
    const pgClient = new PgClient({ connectionString });
    pgClient.connect();
    pgClient
      .query(
        `SELECT dijkstra.edge AS edge,
                dijkstra.node AS node,
                CASE WHEN dijkstra.node = edges_new.source THEN edges_new.htime ELSE edges_new.reverse_htime END AS htime,
                ST_Length(ST_Transform(edges_new.geom, 2056)) AS distance,
                CASE WHEN dijkstra.node = edges_new.source THEN ST_AsText(geom) ELSE ST_AsText(ST_Reverse(geom)) END AS route_geom
        FROM pgr_dijkstra('SELECT id, source, target, cost, reverse_cost FROM edges_new WHERE geom && ST_Expand(
        (SELECT ST_Collect(the_geom) FROM edges_new_vertices_pgr WHERE id IN (${startid}, ${endid})),5000)', ${startid}, ${endid}) AS dijkstra
        JOIN edges_new ON dijkstra.edge = edges_new.id`
      )
      .then(response => {
        resolve(response.rows);
      })
      .catch(err => {
        console.log(err);
        reject(err);
      })
      .then(() => pgClient.end());
  });
};

const routesearch = (req, res) => {
  if (!req.query.vertexids) {
    res.status(401).json({ error: true });
  } else {
    const vertexids = req.query.vertexids.split(",");
    let promises = [];
    for (let idx = 0; idx < vertexids.length - 1; idx += 1) {
      const prom = getRoute(vertexids[idx], vertexids[idx + 1]);
      promises.push(prom);
    }
    Promise.all(promises)
      .then(responses => {
        let duration = 0;
        let edges = [];
        let nodes = [];
        let distances = [];
        let geoms = [];
        for (let response of responses) {
          if (response.length == 0) {
            res.json({ error: "no result" });
            return 0;
          }
          const htime = response.map(item => item.htime);
          duration += htime.reduce((a, b) => a + b);
          edges.push(...response.map(item => item.edge));
          nodes.push(...response.map(item => item.node));
          distances.push(...response.map(item => item.distance));
          geoms.push(...response.map(item => item.route_geom));
        }
        nodes.push(vertexids[vertexids.length - 1].toString());
        const prom1 = getVertexData(nodes, vertexids);
        const prom2 = getWayProperties(edges);
        Promise.all([prom1, prom2])
          .then(data => {
            const { height_y, points } = data[0];
            const { up, down } = getHeightChange(height_y);
            const { surface, rating, size } = data[1];
            const geojson = getGeojson(geoms);
            const { height_x, distance } = getDistance(distances);
            res.json({ geojson, points, duration, distance, height_x, height_y, up, down, surface, rating, size });
          })
          .catch(err => {
            console.log(err);
            res.status(500).json({ error: true });
          });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ error: true });
      });
  }
};

export default routesearch;
