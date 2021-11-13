import Stroke from 'ol/style/Stroke';
import {Icon, Style, Circle, Fill} from 'ol/style';

const wanderwegStyle = (feature, resolution) => {
  const zoom = Math.ceil((Math.log(resolution) - Math.log(156543.03390625)) / Math.log(0.5));
  let strokeWidth;
  if (zoom > 14) {
    strokeWidth = 5;
  } else if (zoom >= 13) {
    strokeWidth = 4;
  } else if (zoom >= 12) {
    strokeWidth = 3;
  } else if (zoom >= 11) {
    strokeWidth = 2;
  } else {
    strokeWidth = 1;
  }

  let color;
  const layer = feature.get('layer');
  if (layer === 'wanderwege') {
    color = '#fbc200';
  } else if (layer === 'bergwanderwege') {
    color = '#bd131e';
  } else if (layer === 'alpinwanderwege') {
    color = '#1762a5';
  } else {
    color = '#FFFFFFFF';
  }

  return new Style({
    stroke: new Stroke({
      color: color,
      width: strokeWidth,
    }),
  });
};

const myPositionTrackerStyle = () => {
  return new Style({
    renderer(coordinates, state) {
      const [[x, y], [x1, y1]] = coordinates;
      const ctx = state.context;
      const dx = x1 - x;
      const dy = y1 - y;
      const radius = Math.sqrt(dx * dx + dy * dy);

      const innerRadius = 0;
      const outerRadius = radius * 1.4;

      const gradient = ctx.createRadialGradient(x, y, innerRadius, x, y, outerRadius);
      gradient.addColorStop(0, 'rgba(255,0,0,0)');
      gradient.addColorStop(0.6, 'rgba(255,0,0,0.2)');
      gradient.addColorStop(1, 'rgba(255,0,0,0.8)');
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
      ctx.strokeStyle = 'rgba(255,0,0,1)';
      ctx.stroke();
    },
  });
};

const searchStyle = (feature, resolution) => {
  const featureId = feature.getId();
  if (featureId === 0) {
    return new Style({
      image: new Icon({
        crossOrigin: 'anonymous',
        src: 'pics/marker/pin.png',
        scale: 0.5,
        anchor: [0.5, 1],
      }),
    });
  } else if (featureId === 998) {
    return new Style({
      image: new Icon({
        crossOrigin: 'anonymous',
        src: 'pics/marker/goal.png',
        scale: 0.4,
        anchor: [0.5, 1],
      }),
    });
  } else if (featureId === 999) {
    return new Style({
      image: new Circle({
        radius: 6,
        stroke: new Stroke({
          color: '#c90a0a',
          width: 4,
        }),
        fill: new Fill({color: '#FFFFFF'}),
      }),
    });
  } else if (featureId) {
    return new Style({
      image: new Icon({
        crossOrigin: 'anonymous',
        src: 'pics/marker/pin.png',
        scale: 0.3,
        anchor: [0.5, 1],
      }),
    });
  } else {
    const zoom = Math.ceil((Math.log(resolution) - Math.log(156543.03390625)) / Math.log(0.5));
    let strokeWidth;
    if (zoom > 14) {
      strokeWidth = 15;
    } else if (zoom >= 13) {
      strokeWidth = 12;
    } else {
      strokeWidth = 8;
    }

    return new Style({
      image: new Circle({
        radius: 6,
        stroke: new Stroke({
          color: '#c90a0a',
          width: 4,
        }),
        fill: new Fill({color: '#FFFFFF'}),
      }),
      stroke: new Stroke({
        color: '#FF000066',
        width: strokeWidth,
      }),
    });
  }
};

const benchStyle = () => {
  return new Style({
    image: new Icon({
      src: 'pics/marker/bench.png',
    }),
  });
};

const firepitStyle = () => {
  return new Style({
    image: new Icon({
      src: 'pics/marker/firepit.png',
    }),
  });
};

const restaurantStyle = () => {
  return new Style({
    image: new Icon({
      src: 'pics/marker/restaurant.png',
    }),
  });
};

const waterfallStyle = () => {
  return new Style({
    image: new Icon({
      src: 'pics/marker/waterfall.png',
    }),
  });
};

const viewpointStyle = () => {
  return new Style({
    image: new Icon({
      src: 'pics/marker/viewpoint.png',
    }),
  });
};

const castleStyle = () => {
  return new Style({
    image: new Icon({
      src: 'pics/marker/castle.png',
    }),
  });
};

const webcamStyle = () => {
  return new Style({
    image: new Icon({
      src: 'pics/marker/webcam.png',
    }),
  });
};

const stationStyle = (feature, resolution) => {
  const sublayer = feature.getProperties()['sublayer'];
  const zoom = Math.ceil((Math.log(resolution) - Math.log(156543.03390625)) / Math.log(0.5));
  if (zoom < 12 || !sublayer) {
    return new Style({
      image: new Icon({
        src: 'pics/piktogramme_bav/BP_generisch.png',
      }),
    });
  } else {
    return new Style({
      image: new Icon({
        src: `pics/piktogramme_bav/${sublayer}.png`,
      }),
    });
  }
};

export {
  wanderwegStyle,
  myPositionTrackerStyle,
  searchStyle,
  benchStyle,
  firepitStyle,
  restaurantStyle,
  webcamStyle,
  stationStyle,
  waterfallStyle,
  viewpointStyle,
  castleStyle,
};
