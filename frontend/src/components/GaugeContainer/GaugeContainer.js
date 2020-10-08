import React from "react";
import "./GaugeContainer.css";
import Gauge from "../Gauge/Gauge";

export default function GaugeContainer(props) {
  if (props.telemetryData === null) {
    return null;
  }

  var velocity = props.telemetryData.crucial_data.find(o => o.name === "velocity");
  var acceleration = props.telemetryData.crucial_data.find(o => o.name === "acceleration");

  return (
    <div className="gauge-container">
      <Gauge
        size={Math.min(window.innerHeight / 4, window.innerWidth / 7)}
        value={velocity}
      />
      <Gauge
        size={Math.min(window.innerHeight / 6, window.innerWidth / 11)}
        value={acceleration}
      />
    </div>
  );
}
