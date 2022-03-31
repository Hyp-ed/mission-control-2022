import React, { useEffect, useState } from "react";
import useWindowDimensions from "./WindowDimensions";
import "./Gauge.css";
import CONSTANTS from "../../constants.json";

export default function Gauge(props) {
  const { height, width } = useWindowDimensions();
  const [size, setSize] = useState(150);
  const [progress, setProgress] = useState(395);
  const [data, setData] = useState({ value: 0, unit: "N/A" });

  useEffect(() => {
    setSize(Math.min((width - 16 * 17) / 8 + 16, (height - 18 * 10) / 4.5 + 35));
  }, [height, width]);

  const position = {
    top: "30px",
    left: Math.min((width - 16 * 17) / 8 + 16 - size) / 2 + "px",
  };

  useEffect(() => {
    if (props.telemetryData === null) return;
    const value = props.telemetryData.navigation[props.gaugeId];
    const dataPointConstants = CONSTANTS.data_point_constants[props.gaugeId];
    setData({
      value,
      ...dataPointConstants,
    });
    setProgress(395 - 197 * ((value - dataPointConstants.min) / (dataPointConstants.max - dataPointConstants.min)));
  }, [props.telemetryData, props.gaugeId]);

  if (props.telemetryData !== null) {
    return (
      <div id={"gauge-" + props.gaugeId} className="gauge container">
        <div className="gauge-title">{props.title}</div>
        <svg
          className="progress-ring"
          width="150px"
          height="150px"
          transform={"scale(" + size / 150 + ")"}
          style={position}
        >
          <text className="progress-value" x="50%" y="50%" textAnchor="middle" fill="white" fontSize="37px">
            {data.value.toFixed(4 - Math.round(data.value).toString().length)}
          </text>
          <text className="progress-unit" x="50%" y="65%" textAnchor="middle" fill="grey" fontSize="16px">
            {data.unit}
          </text>
          <circle
            className="progress-ring-progress"
            stroke="grey"
            strokeWidth="6"
            strokeDasharray="395 395"
            strokeDashoffset="197"
            fill="transparent"
            r="63"
            cx="75"
            cy="75"
          />
          <circle
            className="progress-ring-progress"
            stroke="white"
            strokeWidth="6"
            strokeDasharray="395 395"
            strokeDashoffset={progress}
            fill="transparent"
            r="63"
            cx="75"
            cy="75"
          />
          <circle
            className="progress-ring-stopper"
            stroke="red"
            strokeWidth="7"
            strokeDasharray="395 395"
            strokeDashoffset="351"
            fill="transparent"
            r="63"
            cx="75"
            cy="75"
          />
        </svg>
      </div>
    );
  } else {
    return <div id={"gauge-" + props.gaugeId} className="gauge container"></div>;
  }
}
