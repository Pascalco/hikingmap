import React from 'react';
import axios from 'axios';
import {backend} from '../config';

class Popup extends React.Component {
  state = {
    layer: undefined,
    sublayer: undefined,
    data: undefined,
    lines: undefined,
  };

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      this.setState(
        {
          data: undefined,
          lines: undefined,
        },
        () => this.loadData(),
      );
    }
  }

  addZero = number => {
    if (number < 10) {
      return '0' + number;
    } else {
      return number;
    }
  };

  loadTimetable = ibnr => {
    let lines = [];
    axios
      .get(`https://transport.opendata.ch/v1/stationboard?id=${ibnr}&limit=3`)
      .then(response => {
        const results = response.data.stationboard;
        for (let res of results) {
          if (res.stop.departureTimestamp - Date.now() / 1000 < 3600 * 18) {
            let lineNumber;
            if (res.category === 'B') {
              lineNumber = res.number;
            } else if (res.category === 'R') {
              lineNumber = 'R';
            } else {
              lineNumber = res.category + res.number;
            }
            const line = {
              departure: res.stop.departureTimestamp,
              delay: res.stop.delay,
              to: res.to,
              number: lineNumber,
            };
            lines.push(line);
          }
        }
        this.setState({
          layer: 'station',
          lines: lines,
        });
      })
      .catch(err => console.log(err));
  };

  loadData = () => {
    if (this.props.feature?.id) {
      axios
        .get(`${backend}/getFeature?id=${this.props.feature.id}`)
        .then(response => {
          if (response.data) {
            this.setState({
              layer: response.data.layer,
              sublayer: response.data.sublayer,
              data: response.data.metadata,
            });
            if (this.state.layer === 'station') {
              this.loadTimetable(response.data.metadata.ibnr);
            }
          }
        })
        .catch(err => console.log(err));
    }
  };

  createInfo = (name, icon, link, text) => {
    const img = <img src={`pics/icons/${icon}.png`} width="20" alt={name} />;
    const info = (
      <div className="info" key={name}>
        {link ? (
          <a href={link} target="_blank" rel="noreferrer">
            {img}
          </a>
        ) : (
          img
        )}
        {link ? (
          <a href={link} target="_blank" rel="noreferrer">
            {text}
          </a>
        ) : (
          text
        )}
      </div>
    );
    return info;
  };

  render() {
    if (!this.state.data) {
      return <></>;
    }
    if (this.state.layer === 'webcam') {
      return (
        <>
          <a href={this.state.data.url} target="_blank" rel="noreferrer">
            <img src={this.state.data.toenail} alt="webcam" width="200" />
          </a>
        </>
      );
    } else if (this.state.layer === 'station') {
      let board = [];
      if (this.state.lines) {
        for (let line of this.state.lines) {
          const dep = new Date(line.departure * 1000);
          let entry = (
            <div key={JSON.stringify(line)} className="line">
              <div className="lineNumber">{line.number}</div>
              <div className="lineDirection">{line.to}</div>
              <div className="lineDep">
                {this.addZero(dep.getHours())}:{this.addZero(dep.getMinutes())}
              </div>
            </div>
          );
          board.push(entry);
        }
        if (board.length === 0) {
          board.push(<div>keine Abfahrten heute</div>);
        }
        board.push(
          <a
            href={`https://www.sbb.ch/de/kaufen/pages/fahrplan/fahrplan.xhtml?language=de&von=${this.state.data.name}&nach=`}
            target="_blank"
            rel="noreferrer">
            weitere Abfahrten
          </a>,
        );
      }

      return (
        <div className="popup-content">
          <h1>{this.state.data.name}</h1>
          {board}
        </div>
      );
    } else if (this.state.layer === 'osm') {
      const layertypes = {
        bench: 'Sitzbank',
        firepit: 'Feuerstelle',
        waterfall: 'Wasserfall',
        restaurant: 'Restaurant',
        castle: 'Burg/Schloss',
        viewpoint: 'Aussichtspunkt',
      };
      const castletypes = {
        defensive: 'Burg',
        palace: 'Palast',
        stately: 'Schloss',
        manor: 'Herrenhaus',
        fortress: 'Festung',
        castrum: 'Kastell',
        hillfort: 'Höhenburg',
      };
      const cuisine = {
        regional: 'Regional',
        japanese: 'Japanisch',
        chinese: 'Chinesisch',
        indian: 'Indisch',
        thai: 'Thailändisch',
        asian: 'Asiatisch',
        american: 'Amerikanisch',
        italian: 'Italienisch',
        pizza: 'Pizzaria',
      };
      const license_url = {
        'GFDL-1.2+': 'http://www.gnu.org/licenses/old-licenses/fdl-1.2.html',
        'CC BY 2.0': 'https://creativecommons.org/licenses/by/2.0/',
        'CC-BY-3.0': 'https://creativecommons.org/licenses/by/3.0/',
        'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/',
        'CC-BY-SA-1.0': 'https://creativecommons.org/licenses/by-sa/1.0/',
        'CC-BY-SA-2.0': 'https://creativecommons.org/licenses/by-sa/2.0/',
        'CC BY-SA 2.5': 'https://creativecommons.org/licenses/by-sa/2.5/',
        'CC-BY-SA-2.5-CH': 'https://creativecommons.org/licenses/by-sa/2.5/ch/',
        'CC BY-SA 3.0': 'https://creativecommons.org/licenses/by-sa/3.0/',
        'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
      };

      let layertype = layertypes[this.state.sublayer];
      if (this.state.sublayer === 'castle') {
        if (this.state.data.ruins === 'yes') {
          layertype = 'Ruine';
        } else {
          layertype = castletypes[this.state.data.castle_type] || layertype;
        }
      }

      let title = this.state.data.name ? <h1>{this.state.data.name}</h1> : <></>;
      let altname = this.state.data.alt_name || '';
      let license =
        this.state.data.image_license && this.state.data.image_license !== '-' ? (
          <div className="license">
            by{' '}
            <a href={this.state.data.image_creatorurl} target="_blank" rel="noreferrer">
              {this.state.data.image_creator}
            </a>
            ,{' '}
            <a href={license_url[this.state.data.image_license]} target="_blank" rel="noreferrer">
              {this.state.data.image_license}
            </a>
          </div>
        ) : (
          <></>
        );

      let image = this.state.data.image ? (
        <div className="commonsimage">
          <a href={`https://commons.wikimedia.org/wiki/File:${this.state.data.image}`} target="_blank" rel="noreferrer">
            <img
              src={`pics/commons_images/${this.state.data.image}`}
              alt={this.state.data.name || layertype}
              width="200"
            />
          </a>
          {license}
        </div>
      ) : (
        <></>
      );
      let infos = [];

      if (this.state.data.cuisine) {
        const item = this.createInfo(
          'Cuisine',
          'kitchen',
          '',
          cuisine[this.state.data.cuisine] || this.state.data.cuisine,
        );
        infos.push(item);
      }
      if (this.state.data.wikipedia) {
        const item = this.createInfo('Wikipedia', 'wikipedia', this.state.data.wikipedia, '');
        infos.push(item);
      }
      if (this.state.data.website) {
        let text = this.state.data.website.replace(/https?:\/\/(www.)?/, '').replace(/\/$/, '');
        if (text.length > 25) {
          text = text.substring(0, 23) + '...';
        }
        const item = this.createInfo('Website', 'website', this.state.data.website, text);
        infos.push(item);
      }
      if (this.state.data.phone) {
        const item = this.createInfo('Telefon', 'phone', `tel:${this.state.data.phone}`, this.state.data.phone);
        infos.push(item);
      }
      if (this.state.data.email) {
        const item = this.createInfo('E-Mail', 'email', `mailto:${this.state.data.email}`, this.state.data.email);
        infos.push(item);
      }

      if (this.state.data.opening_hours) {
        let openingHours = this.state.data.opening_hours;
        openingHours = openingHours.replace(/Tu/g, 'Di').replace(/We/g, 'Mi').replace(/Th/g, 'Do').replace(/Su/g, 'So');
        openingHours = openingHours.replace('off', 'geschlossen').replace('PH', 'Feiertage');
        const item = this.createInfo('opening_hours', 'clock', '', openingHours);
        infos.push(item);
      }
      if (this.state.data.backrest === 'yes') {
        const item = this.createInfo('backrest', 'tick', '', 'Rückenlehne');
        infos.push(item);
      }
      if (this.state.data.picnic_table === 'yes') {
        const item = this.createInfo('picnic_table', 'tick', '', 'Picknicktisch');
        infos.push(item);
      }
      if (this.state.data.barbecue_grill === 'yes') {
        const item = this.createInfo('barbecue_grill', 'tick', '', 'Grill');
        infos.push(item);
      }
      if (this.state.data.covered === 'yes') {
        const item = this.createInfo('covered', 'tick', '', 'gedeckt');
        infos.push(item);
      }
      if (this.state.data.covered === 'yes') {
        const item = this.createInfo('shelter', 'tick', '', 'Unterstand');
        infos.push(item);
      }
      if (this.state.data.takeaway === 'yes') {
        const item = this.createInfo('takeaway', 'tick', '', 'Take-Away');
        infos.push(item);
      }

      return (
        <div className="popup-content">
          <h3>{layertype}</h3>
          {title}
          {altname}
          {image}
          {infos}
        </div>
      );
    }

    return (
      <div className="popup-content">
        <span>{this.state.layer}</span>
      </div>
    );
  }
}

export default Popup;
