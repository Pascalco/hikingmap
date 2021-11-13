import React from 'react';
import Plotly from 'plotly.js-basic-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);

class HeightProfile extends React.Component {
  render() {
    return (
      <Plot
        data={[
          {
            x: this.props.x,
            y: this.props.y,
            type: 'scatter',
            mode: 'lines',
            fill: 'tozeroy',
            fillcolor: '#CCC',
            line: {shape: 'spline', smoothing: 0.2, color: '#999'},
            hovertemplate: '%{y}m<extra></extra>',
          },
        ]}
        layout={{
          width: 335,
          height: 120,
          margin: {l: 30, r: 10, t: 10, b: 25, pad: 0},
          xaxis: {hoverformat: '.2f', ticksuffix: ' km', showgrid: false, fixedrange: true},
          yaxis: {
            autorange: false,
            range: [Math.min(...this.props.y) - 50, Math.max(...this.props.y) + 50],
            fixedrange: true,
          },
        }}
        config={{displayModeBar: false}}
        onHover={d => {
          this.props.updatePositionOnRoute(d.xvals[0]);
        }}
      />
    );
  }
}

export default HeightProfile;
