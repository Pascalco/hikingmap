import React, {Suspense} from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Map from 'ol/Map';
import View from 'ol/View';
import {Zoom, ScaleLine, Control} from 'ol/control';
import Overlay from 'ol/Overlay';
import Geolocation from 'ol/Geolocation';
import Point from 'ol/geom/Point';
import Circle from 'ol/geom/Circle';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import along from '@turf/along';
import {toWgs84, toMercator} from '@turf/projection';

import Footer from './Footer';
import {
  mainLayer,
  lkLayer,
  reliefLayer,
  lightLayer,
  aerialLayer,
  myPositionLayer,
  searchLayer,
  featureLayers,
} from '../layers';
import Popup from './Popup';
import LayerSelection from './LayerSelection';
import {backend} from '../config.js';
import {createPdf} from '../print.js';
const Searchbar = React.lazy(() => import('./Searchbar'));

class Swissmap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tracking: false,
      movedToPosition: false,
      clickPosition: [null, null],
    };

    this.mapRef = React.createRef();

    this.myView = new View({
      center: [899236, 5952074],
      zoom: 10,
      minZoom: 9,
      maxZoom: 18,
      projection: 'EPSG:3857',
      enableRotation: false,
    });
  }

  tracking = () => {
    axios.get(`${backend}/dummy?href=${window.location.href}&ref=${document.referrer}`);
  };

  componentDidMount() {
    this.tracking();

    const self = this;

    let locateMeButton = document.createElement('button');
    locateMeButton.innerHTML = '<img src="pics/icons/gps.png" width="20" height="20" alt="geolocate" />';
    locateMeButton.addEventListener('click', this.handleGeolocation, false);
    let locateMeElement = document.createElement('div');
    locateMeElement.className = 'locateme ol-unselectable ol-control';
    locateMeElement.appendChild(locateMeButton);
    this.locateMeControl = new Control({
      element: locateMeElement,
    });

    let printButton = document.createElement('button');
    printButton.innerHTML = '<img src="pics/icons/printer.png" width="20" height="20" alt="geolocate" />';
    printButton.addEventListener('click', createPdf, false);
    let printElement = document.createElement('div');
    printElement.className = 'print ol-unselectable ol-control';
    printElement.appendChild(printButton);
    this.printControl = new Control({
      element: printElement,
    });

    this.map = new Map({
      controls: [new Zoom(), new ScaleLine(), this.locateMeControl, this.printControl],
      view: this.myView,
      layers: [reliefLayer, lightLayer, mainLayer, searchLayer],
      target: this.mapRef.current,
    });

    this.popupEl = document.createElement('div');
    this.popupEl.className = 'popup';
    this.overlay = new Overlay({
      element: this.popupEl,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });
    this.map.addOverlay(this.overlay);

    this.geolocation = new Geolocation({
      trackingOptions: {
        enableHighAccuracy: true,
      },
      projection: this.myView.getProjection(),
    });

    this.geolocation.on('change:tracking', () => {
      const isTracking = self.geolocation.getTracking();
      if (!isTracking) {
        self.map.removeLayer(myPositionLayer);
        this.locateMeControl.element.classList.remove('enabled');
      } else {
        this.locateMeControl.element.classList.add('enabled');
        self.map.addLayer(myPositionLayer);
      }
    });

    this.geolocation.on('change:position', () => {
      const coordinates = self.geolocation.getPosition();
      let myPositionTracker = myPositionLayer.getSource().getFeatures()[0];
      if (coordinates) {
        const accuracy = Math.max(50, self.geolocation.getAccuracy());
        myPositionTracker.setGeometry(new Circle(coordinates, accuracy));
        if (!self.state.movedToPosition && accuracy < 1000) {
          self.myView.setCenter(coordinates);
          self.myView.setZoom(15);
          self.setState({
            movedToPosition: true,
          });
        } else if (!self.state.movedToPosition && accuracy < 10000) {
          self.myView.setCenter(coordinates);
          self.myView.setZoom(17);
        }
      } else {
        myPositionTracker.setGeometry(null);
      }
    });

    this.map.on('singleclick', this.handleMapClick);
    this.map.on('pointermove', this.pointerMove);
    this.map.on('movestart', this.movestart);
  }

  updateSearch = (type, coordinates) => {
    let features;
    if (type === 'remove') {
      searchLayer.getSource().clear();
      return 0;
    } else if (type === 'point') {
      const feature = new Feature({
        geometry: new Point(coordinates),
      });
      feature.setId(0);
      features = [feature];
    } else if (type === 'line') {
      this.route = coordinates.line;
      features = new GeoJSON().readFeatures(coordinates.line, {dataProjection: 'EPSG:3857'});
      for (let idx = 0; idx < coordinates.points.length; idx += 1) {
        const stop = new Feature({
          geometry: new Point(coordinates.points[idx]),
        });
        if (idx === coordinates.points.length - 1) {
          stop.setId(998);
        } else {
          stop.setId(idx);
        }
        features.push(stop);
      }
    }
    searchLayer.getSource().clear();
    searchLayer.getSource().addFeatures(features);
    this.myView.fit(searchLayer.getSource().getExtent(), {padding: [50, 50, 50, 250], maxZoom: 15, duration: 1000});
  };

  updatePositionOnRoute = pos => {
    const oldFeature = searchLayer.getSource().getFeatureById(999);
    if (oldFeature) {
      searchLayer.getSource().removeFeature(oldFeature);
    }
    const line = toWgs84(JSON.parse(this.route));
    const dist = toMercator(along(line, pos));
    let pointFeature = new GeoJSON().readFeature(dist, {dataProjection: 'EPSG:3857'});
    pointFeature.setId(999);
    searchLayer.getSource().addFeature(pointFeature);
  };

  handleMapClick = e => {
    const coordinate = this.map.getEventCoordinate(e.originalEvent);
    const pixel = this.map.getEventPixel(e.originalEvent);
    if (pixel) {
      let features = this.map.getFeaturesAtPixel(pixel, {
        layerFilter: layer => {
          return Object.keys(featureLayers).includes(layer.get('name'));
        },
      });
      if (features.length > 0) {
        this.overlay.setPosition(e.coordinate);
        this.setState({
          clickPosition: coordinate,
        });
        ReactDOM.render(
          <>
            <button className="popup-closer" onClick={this.closePopup}>
              <img src="pics/cross.png" alt="schliessen" width="13" height="13" />
            </button>
            <Popup feature={features[0].getProperties()} />
          </>,
          this.popupEl,
        );
      } else {
        this.setState({
          clickPosition: coordinate,
        });
        this.overlay.setPosition(undefined);
      }
    }
  };

  pointerMove = e => {
    const pixel = this.map.getEventPixel(e.originalEvent);
    const hit = this.map.hasFeatureAtPixel(pixel, {
      layerFilter: layer => {
        return Object.keys(featureLayers).includes(layer.get('name'));
      },
    });
    this.map.getTarget().style.cursor = hit ? 'pointer' : '';
  };

  movestart = () => {
    if (this.state.tracking && !this.state.movedToPosition) {
      this.setState({
        movedToPosition: true,
      });
    }
  };

  closePopup = () => {
    this.overlay.setPosition(undefined);
  };

  handleGeolocation = () => {
    this.geolocation.setTracking(!this.state.tracking);
    this.setState({
      tracking: !this.state.tracking,
      movedToPosition: false,
    });
  };

  updateBackgroundLayer = name => {
    this.map.removeLayer(lkLayer);
    this.map.removeLayer(reliefLayer);
    this.map.removeLayer(lightLayer);
    this.map.removeLayer(aerialLayer);
    if (name === 'leicht') {
      this.map.getLayers().insertAt(0, reliefLayer);
      this.map.getLayers().insertAt(1, lightLayer);
    } else if (name === 'landeskarte') {
      this.map.getLayers().insertAt(0, lkLayer);
    } else if (name === 'luftbild') {
      this.map.getLayers().insertAt(0, aerialLayer);
    }
  };

  updateFeatureLayer = (name, add) => {
    if (add) {
      this.map.addLayer(featureLayers[name]);
    } else {
      this.map.removeLayer(featureLayers[name]);
    }
  };

  render() {
    return (
      <>
        <Suspense fallback={<div>loading...</div>}>
          <Searchbar
            update={this.updateSearch}
            updatePositionOnRoute={this.updatePositionOnRoute}
            clickPosition={this.state.clickPosition}
          />
        </Suspense>
        <main ref={this.mapRef} id="map"></main>
        <LayerSelection
          updateBackgroundLayer={this.updateBackgroundLayer}
          updateFeatureLayer={this.updateFeatureLayer}
        />
        <Footer />
      </>
    );
  }
}

export default Swissmap;
