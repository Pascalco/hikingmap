import {Tile as TileLayer, VectorTile as VectorTileLayer, Vector as VectorLayer} from 'ol/layer';
import {VectorTile as VectorTileSource, Vector as VectorSource} from 'ol/source';
import WMTS from 'ol/source/WMTS';
import Feature from 'ol/Feature';
import MVT from 'ol/format/MVT';
import stylefunction from 'ol-mapbox-style/dist/stylefunction';
import {createXYZ} from 'ol/tilegrid';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import {get as getProjection} from 'ol/proj';
import {mapBackend} from './config';
import lightStyle from './lightStyle.json';

import {
  wanderwegStyle,
  myPositionTrackerStyle,
  searchStyle,
  benchStyle,
  firepitStyle,
  waterfallStyle,
  viewpointStyle,
  restaurantStyle,
  castleStyle,
  stationStyle,
  webcamStyle,
} from './mapStyles';

const proj3857 = getProjection('EPSG:3857');

const resolutions = [];
const matrixIds = [];
const maxResolution = 156543.03392811998;

for (let i = 0; i < 22; i++) {
  matrixIds[i] = i.toString();
  resolutions[i] = maxResolution / Math.pow(2, i);
}
const swisstopoTileGrid = new WMTSTileGrid({
  origin: [-20037508.3428, 20037508.3428],
  resolutions: resolutions,
  matrixIds: matrixIds,
  extend: [-20037508.3428, -20037508.342798717, 20037508.342798717, 20037508.3428],
});

let lkLayer = new TileLayer({
  source: new WMTS({
    requestEncoding: 'REST',
    url: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{TileMatrix}/{TileCol}/{TileRow}.jpeg',
    matrixSet: '3857_21',
    projection: proj3857,
    tileGrid: swisstopoTileGrid,
    wrapX: false,
    crossOrigin: 'anonymous',
  }),
  name: 'lk',
});

let reliefLayer = new TileLayer({
  source: new WMTS({
    requestEncoding: 'REST',
    url: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.leichte-basiskarte_reliefschattierung/default/current/3857/{TileMatrix}/{TileCol}/{TileRow}.png',
    matrixSet: '3857_21',
    projection: proj3857,
    tileGrid: swisstopoTileGrid,
    wrapX: false,
    crossOrigin: 'anonymous',
  }),
  name: 'relief',
});

let aerialLayer = new TileLayer({
  source: new WMTS({
    requestEncoding: 'REST',
    url: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{TileMatrix}/{TileCol}/{TileRow}.jpeg',
    matrixSet: '3857_21',
    projection: proj3857,
    tileGrid: swisstopoTileGrid,
    wrapX: false,
    crossOrigin: 'anonymous',
  }),
  name: 'aerial',
});

let lightLayer = new VectorTileLayer({
  source: new VectorTileSource({
    format: new MVT(),
    tileGrid: createXYZ({tileSize: 512, maxZoom: 14}),
    tilePixelRatio: 8,
    url: 'https://vectortiles.geo.admin.ch/tiles/ch.swisstopo.leichte-basiskarte.vt/v1.0.0/{z}/{x}/{y}.pbf',
    projection: 'EPSG:3857',
  }),
  declutter: true,
  name: 'light',
});

stylefunction(lightLayer, lightStyle, 'swissmaptiles');

let mainLayer = new VectorTileLayer({
  source: new VectorTileSource({
    format: new MVT(),
    tileGrid: createXYZ({tileSize: 512, maxZoom: 15}),
    tilePixelRatio: 8,
    url: `${mapBackend}/wanderwege/{z}/{x}/{y}.pbf`,
    projection: 'EPSG:3857',
  }),
  style: wanderwegStyle,
  name: 'wanderweg',
});

let myPositionLayer = new VectorLayer({
  source: new VectorSource({
    features: [new Feature()],
  }),
  style: myPositionTrackerStyle,
  name: 'myPosition',
});

let searchLayer = new VectorLayer({
  source: new VectorSource({
    features: [new Feature()],
  }),
  style: searchStyle,
  name: 'search',
});

/* feature layers */

let benchLayer = new VectorTileLayer({
  source: new VectorTileSource({
    format: new MVT(),
    tileGrid: createXYZ({tileSize: 512, maxZoom: 15}),
    tilePixelRatio: 8,
    url: `${mapBackend}/bench/{z}/{x}/{y}.pbf`,
    projection: 'EPSG:3857',
  }),
  style: benchStyle,
  name: 'bench',
});

let firepitLayer = new VectorTileLayer({
  source: new VectorTileSource({
    format: new MVT(),
    tileGrid: createXYZ({tileSize: 512, maxZoom: 15}),
    tilePixelRatio: 8,
    url: `${mapBackend}/firepit/{z}/{x}/{y}.pbf`,
    projection: 'EPSG:3857',
  }),
  style: firepitStyle,
  name: 'firepit',
});

let castleLayer = new VectorTileLayer({
  source: new VectorTileSource({
    format: new MVT(),
    tileGrid: createXYZ({tileSize: 512, maxZoom: 15}),
    tilePixelRatio: 8,
    url: `${mapBackend}/castle/{z}/{x}/{y}.pbf`,
    projection: 'EPSG:3857',
  }),
  style: castleStyle,
  name: 'castle',
});

let restaurantLayer = new VectorTileLayer({
  source: new VectorTileSource({
    format: new MVT(),
    tileGrid: createXYZ({tileSize: 512, maxZoom: 15}),
    tilePixelRatio: 8,
    url: `${mapBackend}/restaurant/{z}/{x}/{y}.pbf`,
    projection: 'EPSG:3857',
  }),
  style: restaurantStyle,
  name: 'restaurant',
});

let waterfallLayer = new VectorTileLayer({
  source: new VectorTileSource({
    format: new MVT(),
    tileGrid: createXYZ({tileSize: 512, maxZoom: 15}),
    tilePixelRatio: 8,
    url: `${mapBackend}/waterfall/{z}/{x}/{y}.pbf`,
    projection: 'EPSG:3857',
  }),
  style: waterfallStyle,
  name: 'waterfall',
});

let viewpointLayer = new VectorTileLayer({
  source: new VectorTileSource({
    format: new MVT(),
    tileGrid: createXYZ({tileSize: 512, maxZoom: 15}),
    tilePixelRatio: 8,
    url: `${mapBackend}/viewpoint/{z}/{x}/{y}.pbf`,
    projection: 'EPSG:3857',
  }),
  style: viewpointStyle,
  name: 'viewpoint',
});

let webcamLayer = new VectorTileLayer({
  source: new VectorTileSource({
    format: new MVT(),
    tileGrid: createXYZ({tileSize: 512, maxZoom: 15}),
    tilePixelRatio: 8,
    url: `${mapBackend}/webcam/{z}/{x}/{y}.pbf`,
    projection: 'EPSG:3857',
  }),
  style: webcamStyle,
  name: 'webcam',
});

let stationLayer = new VectorTileLayer({
  source: new VectorTileSource({
    format: new MVT(),
    tileGrid: createXYZ({tileSize: 512, maxZoom: 15}),
    tilePixelRatio: 8,
    projection: 'EPSG:3857',
    url: `${mapBackend}/station/{z}/{x}/{y}.pbf`,
  }),
  style: stationStyle,
  name: 'station',
});

const featureLayers = {
  bench: benchLayer,
  restaurant: restaurantLayer,
  firepit: firepitLayer,
  waterfall: waterfallLayer,
  viewpoint: viewpointLayer,
  station: stationLayer,
  castle: castleLayer,
  webcam: webcamLayer,
};

export {lkLayer, reliefLayer, lightLayer, aerialLayer, mainLayer, myPositionLayer, searchLayer, featureLayers};
