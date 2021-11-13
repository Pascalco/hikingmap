import React from 'react';
import {Scrollbars} from 'react-custom-scrollbars';

class Nameresult extends React.Component {
  formatValue = item => {
    if (item.type === 'Ort' && item.name === item.municipality) {
      return (
        <>
          <b>{item.name}</b>
          <br />
          <i>{item.type}</i>
        </>
      );
    } else if (item.type === 'Gebäude') {
      return (
        <>
          <b>{item.name}</b> - {item.municipality}
        </>
      );
    } else {
      return (
        <>
          <b>{item.name}</b> - {item.municipality}
          <br />
          <i>{item.type}</i>
        </>
      );
    }
  };

  render() {
    return (
      <Scrollbars autoHeight autoHeightMax={250}>
        <div className="searchresult">
          {this.props.searchvalues.map((item, idx) => (
            <div
              onClick={() => this.props.selectName(item, this.props.activeField)}
              key={item.id}
              className={this.props.cursorPosition === idx ? 'active' : null}>
              {this.formatValue(item)}
            </div>
          ))}
        </div>
      </Scrollbars>
    );
  }
}

export default Nameresult;
