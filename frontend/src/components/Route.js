import React from 'react';
import {Scrollbars} from 'react-custom-scrollbars';
import BarChart from './BarChart';
import HeightProfile from './HeightProfile';

class Route extends React.Component {
  state = {
    maxheight: window.innerHeight - 300,
  };

  componentDidMount() {
    window.addEventListener('resize', () => {
      this.setState({
        maxheight: window.innerHeight - 300,
      });
    });
  }

  formatDistance = val => {
    if (val < 1000) {
      return <span>{Math.round(val / 10) * 10} m</span>;
    } else {
      return <span>{Math.round(val / 100) / 10} km</span>;
    }
  };

  formatDuration = val => {
    val /= 60;
    if (val < 30) {
      return <span>{Math.round(val)} min</span>;
    } else {
      val = Math.round(val / 5) * 5;
      if (val < 60) {
        return <span>{val} min</span>;
      } else {
        return (
          <span>
            {Math.floor(val / 60)} h {val % 60} min
          </span>
        );
      }
    }
  };

  render() {
    let searchresult;
    if (this.props.route && !this.props.route.error && !this.props.routesearchcollapsed) {
      searchresult = (
        <>
          <div className="route_details">
            <div>
              <img src="pics/clock.png" alt="Dauer" width="12" /> {this.formatDuration(this.props.route.duration)}
            </div>
            <div>
              <img src="pics/arrow_right.png" alt="Distanz" width="15" />{' '}
              {this.formatDistance(this.props.route.distance)}
            </div>
            <div>
              <img src="pics/arrow_up_right.png" alt="Aufstieg" width="12" /> {Math.round(this.props.route.up)} m
            </div>
            <div>
              <img src="pics/arrow_down_right.png" alt="Abstieg" width="12" /> {Math.round(this.props.route.down)} m
            </div>
          </div>
          <Scrollbars autoHeight autoHeightMax={this.state.maxheight}>
            <div className="height_profile">
              <HeightProfile
                x={this.props.route.height_x}
                y={this.props.route.height_y}
                updatePositionOnRoute={this.props.updatePositionOnRoute}
              />
            </div>
            <BarChart data={this.props.route.rating} type="rating" distance={this.props.route.distance} />
            <BarChart data={this.props.route.surface} type="surface" distance={this.props.route.distance} />
            <BarChart data={this.props.route.size} type="size" distance={this.props.route.distance} />
          </Scrollbars>
        </>
      );
    } else if (this.props.route && this.props.route.error) {
      searchresult = 'keine Route gefunden';
    } else {
      searchresult = <></>;
    }
    return searchresult;
  }
}

export default Route;
