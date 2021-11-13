import React, {Suspense} from 'react';
import axios from 'axios';
import {toWgs84} from '@turf/projection';
import {point} from '@turf/helpers';
import {isDesktop, isMobile} from 'react-device-detect';
import {backend} from '../config';
import OutsideAlerter from './OutsideAlerter';

const Nameresult = React.lazy(() => import('./Nameresult'));
const Route = React.lazy(() => import('./Route'));

class Searchbar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      routesearch: false,
      routesearchcollapsed: true,
      searchvalues: [],
      activeField: 1,
      hoveredField: -1,
      searchWords: ['', ''],
      searchIds: [false, false],
      noStops: 1,
      route: false,
      loading: false,
      cursorPosition: -1,
    };
    this.cancelToken = axios.CancelToken.source();
    this.inputFields = [];
  }

  componentDidMount() {
    this.inputFields[1].focus();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.clickPosition !== this.props.clickPosition) {
      if (this.state.routesearch && this.state.searchWords[this.state.activeField] === '') {
        axios
          .get(`${backend}/getnearestvertex?lon=${this.props.clickPosition[0]}&lat=${this.props.clickPosition[1]}`)
          .then(response => {
            let searchWords = this.state.searchWords;
            let searchIds = this.state.searchIds;
            const wgs84 = toWgs84(point(this.props.clickPosition));
            searchWords[this.state.activeField] = wgs84.geometry.coordinates
              .map(c => Math.round(c * 1000) / 1000)
              .join(', ');
            searchIds[this.state.activeField] = {vertexid: response.data.id, id: undefined};
            this.setState(
              {
                searchWords: searchWords,
                searchIds: searchIds,
              },
              () => {
                this.searchRoute();
              },
            );
          })
          .catch(err => {
            console.log(err);
          });
      }
    }
  }

  getFocus = e => {
    if (isDesktop) {
      if (!e.currentTarget.contains(e.relatedTarget)) {
        if (!e.relatedTarget || e.relatedTarget.className !== 'keepfocus') {
          let self = this;
          if (this.state.activeField && this.inputFields[this.state.activeField]) {
            setTimeout(function () {
              self.inputFields[self.state.activeField].focus();
            }, 0);
          }
        }
      }
    }
  };

  updateFocus = () => {
    const nextFocusedField = this.state.activeField === this.state.noStops ? 0 : this.state.activeField + 1;
    this.inputFields[nextFocusedField].focus();
  };

  handleOnFocus = field => {
    this.setState({
      activeField: field,
    });
  };

  handleOnHover = field => {
    this.setState({
      hoveredField: field,
    });
  };

  addStopover = () => {
    let searchIds = this.state.searchIds;
    let searchWords = this.state.searchWords;
    searchIds.splice(this.state.noStops, 0, false);
    searchWords.splice(this.state.noStops, 0, '');
    this.inputFields[this.state.noStops].focus();
    this.setState({
      noStops: this.state.noStops + 1,
      searchIds: searchIds,
      searchWords: searchWords,
    });
  };

  removeStop = idx => {
    let searchIds = this.state.searchIds;
    let searchWords = this.state.searchWords;
    searchIds.splice(idx, 1);
    searchWords.splice(idx, 1);
    this.inputFields[0].focus();
    this.setState(
      {
        noStops: this.state.noStops - 1,
        searchIds: searchIds,
        searchWords: searchWords,
      },
      () => {
        this.searchRoute();
      },
    );
  };

  onClickSearch = () => {
    if (this.state.searchvalues.length > 0) {
      if (this.state.cursorPosition > -1) {
        this.selectName(this.state.searchvalues[this.state.cursorPosition], this.state.activeField);
      } else {
        this.selectName(this.state.searchvalues[0], this.state.activeField);
      }
    } else if (this.state.searchIds[1].id) {
      this.searchPoint(this.state.searchIds[1].id);
    }
  };

  openRouteSearch = () => {
    this.setState(
      {
        routesearch: true,
        route: false,
        searchvalues: [],
      },
      () => {
        this.inputFields[0].focus();
        this.searchRoute();
      },
    );
  };

  closeRouteSearch = () => {
    this.props.update('remove');
    this.setState(
      {
        routesearch: false,
        route: false,
        searchvalues: [],
        searchWords: ['', this.state.searchWords[this.state.searchWords.length - 1]],
        searchIds: ['', this.state.searchIds[this.state.searchIds.length - 1]],
      },
      () => {
        this.inputFields[1].focus();
      },
    );
  };

  collapseRouteSearch = () => {
    this.setState({
      routesearchcollapsed: !this.state.routesearchcollapsed,
    });
  };

  handleClickOutside = () => {
    if (!this.state.routesearchcollapsed) {
      this.collapseRouteSearch();
    }
  };

  switchDestinations = () => {
    let searchWords = this.state.searchWords;
    searchWords.reverse();
    let searchIds = this.state.searchIds;
    searchIds.reverse();
    this.setState(
      {
        searchWords: searchWords,
        searchIds: searchIds,
        searchvalues: [],
      },
      () => {
        if (searchIds[0] && searchIds[this.state.noStops]) {
          this.searchRoute();
        }
      },
    );
  };

  searchRoute = () => {
    let vertexids = [];
    for (let idx = 0; idx <= this.state.noStops; idx += 1) {
      if (this.state.searchIds[idx].vertexid) {
        vertexids.push(this.state.searchIds[idx].vertexid);
      } else if (this.state.searchWords[idx]) {
        this.getBestMatch(idx);
        vertexids = [];
        break;
      }
    }
    //only search route if at least two places are entered
    if (vertexids.length >= 2) {
      if (isMobile) {
        document.getElementById('map').focus();
      } else {
        console.log('is not mobile');
      }
      this.setState(
        {
          loading: true,
        },
        () => {
          axios
            .get(`${backend}/routesearch?vertexids=${vertexids.join(',')}`)
            .then(response => {
              this.setState({
                route: response.data,
                loading: false,
                routesearchcollapsed: false,
              });
              if (!response.data.error) {
                this.props.update('line', {line: response.data.geojson, points: response.data.points});
              }
            })
            .catch(err => {
              console.log('error', err);
              this.setState({
                loading: false,
              });
            });
        },
      );
    } else {
      //only one field is filled -> focus the next field
      this.updateFocus();
    }
  };

  searchPoint = id => {
    axios
      .get(`${backend}/getcoordinate?id=${id}`)
      .then(response => {
        if (response.data.n !== null) {
          this.props.update('point', [parseInt(response.data.e), parseInt(response.data.n)]);
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  typing = (event, field) => {
    this.cancelToken.cancel('Operation canceled due to input changes');
    this.cancelToken = axios.CancelToken.source();
    const searchWords = this.state.searchWords;
    searchWords[field] = event.target.value;
    const searchIds = this.state.searchIds;
    searchIds[field] = false;
    this.setState({
      searchWords: searchWords,
      searchIds: searchIds,
      activeField: field,
    });
    axios
      .get(`${backend}/search`, {params: {q: event.target.value}, cancelToken: this.cancelToken.token})
      .then(response => {
        this.setState({searchvalues: response.data, cursorPosition: -1});
      })
      .catch(err => {
        //console.log("error", err);
      });
  };

  handleOnKeyDown = (event, field) => {
    if (event.keyCode === 40) {
      //down arrow
      let newCursorPosition = Math.min(this.state.cursorPosition + 1, this.state.searchvalues.length - 1);
      this.setState({
        cursorPosition: newCursorPosition,
      });
    } else if (event.keyCode === 38) {
      //up arrow
      let newCursorPosition = Math.max(this.state.cursorPosition - 1, -1);
      this.setState({
        cursorPosition: newCursorPosition,
      });
    } else if (event.keyCode === 13 && this.state.cursorPosition > -1) {
      //enter (one must have select an item from the dropdown)
      this.selectName(this.state.searchvalues[this.state.cursorPosition], field);
    }
  };

  selectName = (item, field) => {
    let searchWords = this.state.searchWords;
    let searchIds = this.state.searchIds;
    searchWords[field] = item.name;
    searchIds[field] = {vertexid: item.vertexid, id: item.id};
    this.setState(
      {
        searchvalues: [],
        searchWords: searchWords,
        searchIds: searchIds,
        cursorPosition: -1,
      },
      () => {
        if (!this.state.routesearch) {
          this.searchPoint(item.id);
        } else {
          this.searchRoute();
        }
      },
    );
  };

  getBestMatch = field => {
    if (this.state.searchWords[field]) {
      axios
        .get(`${backend}/search?q=${this.state.searchWords[field]}`)
        .then(response => {
          if (response.data.length > 0) {
            this.selectName(response.data[0], field);
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  render() {
    let searchbox;
    let inputfields = [];
    if (this.state.routesearch) {
      for (let idx = 0; idx <= this.state.noStops; idx += 1) {
        if (this.state.routesearchcollapsed && idx > 0 && idx < this.state.noStops) {
          continue;
        }
        let text;
        let icon;
        if (idx === 0) {
          text = 'von';
          icon = 'pin';
        } else if (idx === this.state.noStops) {
          text = 'nach';
          icon = 'goal';
        } else {
          text = 'via';
          icon = 'circle';
        }

        const input = (
          <div onMouseEnter={() => this.handleOnHover(idx)} key={idx}>
            <img
              src={`pics/${icon}.png`}
              alt="pin"
              width="16"
              height="16"
              className={idx === this.state.activeField ? 'focus' : ''}
            />
            <input
              className="searchinputfield"
              type="text"
              placeholder={`${text} ${this.state.activeField === idx ? '(eingeben oder auf Karte klicken)' : ''}`}
              value={this.state.searchWords[idx]}
              onChange={e => this.typing(e, idx)}
              onKeyDown={e => this.handleOnKeyDown(e, idx)}
              onFocus={() => this.handleOnFocus(idx)}
              ref={inputEl => (this.inputFields[idx] = inputEl)}
            />
            {this.state.hoveredField === idx && this.state.noStops > 1 ? (
              <button className="blankButton" onClick={() => this.removeStop(idx)}>
                <img src="pics/cross.png" alt="close" width="15" height="15" className="focus" />
              </button>
            ) : (
              <></>
            )}
          </div>
        );
        inputfields.push(input);
        if (idx < this.state.noStops) {
          inputfields.push(<div className="horizontal_line" key={`div_${idx}`} />);
        }
      }
    } else {
      const idx = 1;
      const input = (
        <input
          key={1}
          className="searchinputfield fulllength"
          type="text"
          placeholder="Suchen..."
          value={this.state.searchWords[idx]}
          onChange={e => this.typing(e, idx)}
          onKeyDown={e => this.handleOnKeyDown(e, idx)}
          onFocus={() => this.handleOnFocus(idx)}
          ref={inputEl => (this.inputFields[idx] = inputEl)}
        />
      );
      inputfields.push(input);
    }

    if (this.state.routesearch) {
      let collapsebutton;
      if (!this.state.routesearchcollapsed) {
        collapsebutton = (
          <button onClick={this.collapseRouteSearch} className="blankButton">
            <img src="pics/up.png" alt="einklappen" width="13" height="13" className="collapse_icon nav_icon" />
          </button>
        );
      } else if (this.state.route) {
        collapsebutton = (
          <button onClick={this.collapseRouteSearch} className="blankButton">
            <img src="pics/down.png" alt="ausklappen" width="13" height="13" className="collapse_icon nav_icon" />
          </button>
        );
      } else {
        collapsebutton = <></>;
      }

      searchbox = (
        <>
          {collapsebutton}
          <h4>Routensucher</h4>
          <button onClick={this.closeRouteSearch} className="blankButton">
            <img src="pics/cross.png" alt="schliessen" width="13" height="13" className="close_icon nav_icon" />
          </button>
          <div className="searchbar">
            <div className="searchinputfields">{inputfields}</div>
            <div>
              <button onClick={this.switchDestinations} className="blankButton">
                <img src="pics/change.png" alt="Route umkehren" width="18" height="18" className="nav_icon" />
              </button>
            </div>
          </div>
          <div className="addStopover">
            {!this.state.searchIds.includes(false) && !this.state.routesearchcollapsed ? (
              <>
                <button className="blankButton" onClick={this.addStopover}>
                  <img src="pics/add.png" width="15" height="15" alt="add" />
                </button>
                <span>Zwischenziel hinzufügen</span>
              </>
            ) : (
              <></>
            )}
          </div>
        </>
      );
    } else {
      searchbox = (
        <div className="searchbar">
          {inputfields}
          <button onClick={this.onClickSearch} className="blankButton">
            <img src="pics/search.png" alt="suchen" width="18" height="18" className="nav_icon" />
          </button>
          <div className="vertical_line"></div>
          <button onClick={this.openRouteSearch} className="blankButton">
            <img src="pics/junction.png" alt="Route suchen" width="15" height="19" className="nav_icon" />
          </button>
        </div>
      );
    }

    let belowSearchbox;
    if (this.state.searchvalues.length > 0) {
      belowSearchbox = (
        <Suspense fallback={<div>loading...</div>}>
          <Nameresult
            searchvalues={this.state.searchvalues}
            activeField={this.state.activeField}
            cursorPosition={this.state.cursorPosition}
            selectName={this.selectName}
          />
        </Suspense>
      );
    } else if (this.state.loading) {
      belowSearchbox = (
        <div className="center">
          <img src="pics/loading.gif" alt="loading" width="30" />
        </div>
      );
    } else if (this.state.route) {
      belowSearchbox = (
        <Suspense fallback={<div>loading...</div>}>
          <Route
            route={this.state.route}
            routesearchcollapsed={this.state.routesearchcollapsed}
            updatePositionOnRoute={this.props.updatePositionOnRoute}
          />
        </Suspense>
      );
    } else {
      belowSearchbox = <></>;
    }

    return (
      <OutsideAlerter onOutsideClick={this.handleClickOutside}>
        <div className="searchbox noprint" onBlur={e => this.getFocus(e)}>
          {searchbox}
          {belowSearchbox}
        </div>
      </OutsideAlerter>
    );
  }
}

export default Searchbar;
