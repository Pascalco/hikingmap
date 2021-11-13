import React from 'react';
import Plotly from 'plotly.js-basic-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);

class BarChart extends React.Component {
  getColor = data => {
    const colorSurface = ['#347200', '#499609', '#60B917'];
    const colorsSize = ['#11757E', '#2A848C', '#46979E'];
    return data.map((x, idx) => {
      if (this.props.type === 'rating') {
        if (x.class === 'Wanderweg') {
          return '#fbc200';
        } else if (x.class === 'Bergwanderweg') {
          return '#bd131e';
        } else if (x.class === 'Alpinwanderweg') {
          return '#1762a5';
        }
      } else if (this.props.type === 'surface') {
        return colorSurface[idx];
      } else if (this.props.type === 'size') {
        return colorsSize[idx];
      }
      return '#000000';
    });
  };

  cleanData = data => {
    data = data.sort((a, b) => a.value - b.value);
    if (this.props.type === 'size') {
      if (data.length > 3) {
        return [
          {value: this.props.distance - data[data.length - 1].value - data[data.length - 2].value, class: 'andere'},
          data[data.length - 2],
          data[data.length - 1],
        ];
      }
    } else if (this.props.type === 'surface') {
      return data.filter(x => x.value / this.props.distance > 0.1 || x.class !== 'k_W');
    }
    return data;
  };

  getPercentage = data => {
    const sum = data.map(x => x.value).reduce((a, b) => a + b);
    const data_appended = data.map(x => {
      const perc = Math.round((x.value / sum) * 100);
      x.percentage = perc;
      return x;
    });
    return data_appended;
  };

  render() {
    let data = this.cleanData(this.props.data);
    data = this.getPercentage(data);
    const colors = this.getColor(data);
    const x_vals = data.map(x => x.percentage);
    const labels = data.map(x => `${x.class} (${x.percentage}%)`);

    const height = data.length * 20;
    const alldata = [
      {
        x: x_vals,
        y: labels,
        text: labels,
        type: 'bar',
        textposition: 'auto',
        orientation: 'h',
        hoverinfo: 'skip',
        marker: {
          color: colors,
        },
      },
    ];
    return (
      <Plot
        data={alldata}
        layout={{
          margin: {l: 0, r: 0, t: 0, b: 0, pad: 0},
          showlegend: false,
          width: 330,
          height: height,
          xaxis: {visible: false, fixedrange: true, range: [0, 100]},
          yaxis: {visible: false, fixedrange: true},
          bargap: 0,
        }}
        config={{displayModeBar: false}}
      />
    );
  }
}

export default BarChart;
