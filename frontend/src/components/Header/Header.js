import React, { useState, useEffect } from "react";
import "./Header.css";
import logo from "../../hyped.png";
import PositionBar from "../PositionBar/PositionBar";

export default function Header(props) {
  const [time, setTime] = useState(0);

  const telemetryConnectionStyle = props.telemetryConnection
    ? "pod-connection connected"
    : "pod-connection disconnected";

  useEffect(() => {
    if (props.endTime != 0) {
      return;
    }
    if (props.startTime == 0) {
      return;
    }
    const interval = setInterval(() => {
      setTime(Date.now() - props.startTime);
    }, 1); // runs every milisecond
    return () => clearInterval(interval);
  }, [props.startTime, props.endTime]); //sets interval once when timer state changes

  const formatTime = duration => {
    var milliseconds = parseInt(duration % 1000),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    if (milliseconds < 10) {
      milliseconds = "00" + milliseconds;
    } else if (milliseconds < 100) {
      milliseconds = "0" + milliseconds;
    }

    return "T+ " + minutes + ":" + seconds + "." + milliseconds;
  };

  var distance = 0;
  if (props.telemetryData !== null) {
    distance = props.telemetryData.crucial_data.find(o => o.name === "distance").value;
    distance = Math.round((distance + Number.EPSILON) * 100) / 100
  }

  if (props.telemetryData !== null) {
    return (
      <header className="header-root">
        <img src={logo} className="hyped-logo" alt="logo" />
        
        <PositionBar telemetryData={props.telemetryData} />
        <p className="timer">{formatTime(time)}</p>
        <div className="pod-status">
          <div className={telemetryConnectionStyle}>
            {props.telemetryConnection ? "CONNECTED" : "DISCONNECTED"}
          </div>
          <div className="pod-state">{props.state}</div>
          <div className="backend-connection">
            {props.baseStationConnection ? "" : "NOT CONNECTED TO BACKEND"}
          </div>
        </div>
      </header>
    );
  }  else {
    return (
      <header className="header-root">
        <img src={logo} className="hyped-logo" alt="logo" />
        
        <p className="timer">{formatTime(time)}</p>
        <div className="pod-status">
          <div className={telemetryConnectionStyle}>
            {props.telemetryConnection ? "CONNECTED" : "DISCONNECTED"}
          </div>
          <div className="pod-state">{props.state}</div>
          <div className="backend-connection">
            {props.baseStationConnection ? "" : "NOT CONNECTED TO BACKEND"}
          </div>
        </div>
      </header>
    );
  }

}
