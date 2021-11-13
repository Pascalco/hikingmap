import React from 'react';
import axios from 'axios';
import OutsideAlerter from './OutsideAlerter';
import {backend} from '../config.js';

class LayerSelection extends React.Component {
  constructor(props) {
    super(props);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.state = {
      showLayerSelection: false,
      background: 'leicht',
      features: {
        firepit: false,
        waterfall: false,
        viewpoint: false,
        station: false,
        restaurant: false,
        bench: false,
        castle: false,
        webcam: false,
      },
    };
  }

  tracking = () => {
    let features = Object.entries(this.state.features)
      .map(m => (m[1] ? m[0] : ''))
      .join(',');
    axios.get(`${backend}/dummy?background=${this.state.background}&features=${features}`);
  };

  toggleLayerSelection = () => {
    this.setState({
      showLayerSelection: !this.state.showLayerSelection,
    });
  };

  changeBackgroundLayer = name => {
    this.setState({
      background: name,
    });
    this.props.updateBackgroundLayer(name);
    this.tracking();
  };

  changeFeatureLayer = name => {
    let newFeatures = this.state.features;
    if (newFeatures[name]) {
      newFeatures[name] = false;
      this.props.updateFeatureLayer(name, false);
    } else {
      newFeatures[name] = true;
      this.props.updateFeatureLayer(name, true);
    }
    this.setState({
      features: newFeatures,
    });
    this.tracking();
  };

  handleClickOutside() {
    if (this.state.showLayerSelection) {
      this.toggleLayerSelection();
    }
  }

  render() {
    let backgroundLayerNames = ['Leicht', 'Landeskarte', 'Luftbild'];
    let backgroundlayerSelection = [];
    for (let m of backgroundLayerNames) {
      backgroundlayerSelection.push(
        <div
          onClick={() => this.changeBackgroundLayer(m.toLowerCase())}
          key={m}
          className={this.state.background === m.toLocaleLowerCase() ? 'active' : ''}>
          <img src={`pics/layer/${m.toLocaleLowerCase()}.png`} alt={m} width="70" height="70" />
        </div>,
      );
    }

    const featureLayerNames = {
      firepit: 'Feuerstellen',
      waterfall: 'Wasserfälle',
      station: 'ÖV-Haltestellen',
      restaurant: 'Restaurants',
      bench: 'Sitzbänke',
      castle: 'Burgen & Schlösser',
      viewpoint: 'Aussichtspunkte',
      webcam: 'Webcams',
    };
    let featureLayerSelection = [];
    for (let [key, value] of Object.entries(featureLayerNames)) {
      const layer = (
        <div
          onClick={() => this.changeFeatureLayer(key)}
          key={key}
          className={this.state.features[key] ? 'active' : ''}>
          <img src={`pics/layer/${key}.png`} alt={value} width="50" height="50" />
        </div>
      );
      featureLayerSelection.push(layer);
    }

    return (
      <OutsideAlerter onOutsideClick={this.handleClickOutside}>
        <div className="layerselectionbutton noprint">
          <button title="Karte auswählen" onClick={this.toggleLayerSelection}>
            <img src="pics/layer.png" width="50" height="50" alt="layer" />
          </button>
        </div>
        <div className={`layerselectionframe ${this.state.showLayerSelection ? 'is-open' : null}`}>
          <h4>Kartendetails</h4>
          <div className={'layerselection'}>{featureLayerSelection}</div>
          <h4>Kartenhintergrund</h4>
          <div className={'layerselection'}>{backgroundlayerSelection}</div>
        </div>
      </OutsideAlerter>
    );
  }
}

export default LayerSelection;
