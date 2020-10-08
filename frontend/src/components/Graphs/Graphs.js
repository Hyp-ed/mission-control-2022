import React from "react";
import "./Graphs.css";
import { defaults } from "react-chartjs-2";

const accentColor = "#8F8F8F";

const setGraphDefaults = () => {
  defaults.global.animation = false;
  defaults.global.elements.point.radius = 0;
  defaults.global.defaultFontFamily = "Roboto Mono";
  defaults.global.defaultFontColor = accentColor;
  defaults.global.tooltips.enabled = false;
  defaults.global.maintainAspectRatio = false;
  defaults.global.responsive = true;
  defaults.global.elements.line.tension = 0;
  defaults.global.elements.line.borderWidth = 1.5;
  defaults.global.elements.line.fill = false;
  defaults.global.plugins.streaming.frameRate = 60;
  defaults.line.scales.xAxes[0] = {
    realtime: {
      ttl: undefined // automatically delete data after it disappears off the graph
    },
    ticks: { display: false },
    gridLines: { display: false },
    type: "time",
    time: { parser: "DD/MM/YYYY" }
  };
  defaults.line.scales.yAxes[0] = {
    gridLines: {
      color: accentColor,
      zeroLineColor: accentColor // x-axis color
    }
  };
};
setGraphDefaults();

export default function Graphs(props) {
  if (props.isInactive) {
    return null;
  }
  return <div className="graphs-container">{props.graphs}</div>;
}
