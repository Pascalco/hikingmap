import React from 'react';
import {Link} from 'react-router-dom';

class Contact extends React.Component {
  render() {
    return (
      <>
        <Link to="/">zurück zur Karte</Link>
        <div className="contact">
          <h1>hikingmap.ch</h1>
          <h2>Datenquellen</h2>
          <ul>
            <li>
              Map data
              <ul>
                <li>
                  <a href="https://www.swisstopo.ch">Bundesamt für Landestopografie swisstopo</a>
                </li>
                <li>
                  <a href="https://www.osm.org">OpenStreetMap contributors</a> (
                  <a href="www.openstreetmap.org/copyright">License</a>)
                </li>
              </ul>
            </li>
            <li>
              <div>
                Icons made by{' '}
                <a href="https://www.flaticon.com/authors/vectors-market" title="Vectors Market">
                  Vectors Market
                </a>
                ,{' '}
                <a href="https://www.freepik.com" title="Freepik">
                  Freepik
                </a>
                {' and '}
                <a href="https://www.flaticon.com/authors/those-icons" title="Those Icons">
                  Those Icons
                </a>{' '}
                from{' '}
                <a href="https://www.flaticon.com/" title="Flaticon">
                  www.flaticon.com
                </a>
              </div>
            </li>
            <li>
              Webcams provided by{' '}
              <a href="https://www.windy.com/" target="_blank" rel="noreferrer">
                windy.com
              </a>
            </li>
          </ul>
          <h2>Kontakt</h2>
          Pascal Leimer
          <br />
          Laurenzenvorstadt 25, 5000 Aarau, Schweiz
          <br />
          pascal.leimer [at] bluewin.ch
        </div>
      </>
    );
  }
}

export default Contact;
