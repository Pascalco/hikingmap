import React from 'react';
import {Link} from 'react-router-dom';

class Footer extends React.Component {
  render() {
    return (
      <footer className="footer nprint">
        <span>
          <Link to="/contact">Kontakt | Datenquellen</Link>
        </span>
      </footer>
    );
  }
}

export default Footer;
