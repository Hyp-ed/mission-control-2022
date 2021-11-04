import "./Timer.css";

import React, { useEffect, useState } from "react";

export default function Timer({ telemetryData, startTime, endTime }) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (endTime !== 0) {
      return;
    }
    if (startTime === 0) {
      // eslint-disable-next-line consistent-return
      return () => setTime(0);
    }
    // eslint-disable-next-line consistent-return
    return () => setTime(telemetryData.time - startTime);
  }, [startTime, endTime, telemetryData]); // sets interval once when timer state changes

  const formatTime = (duration) => {
    let milliseconds = parseInt(duration % 1000, 10);
    let seconds = Math.floor((duration / 1000) % 60);
    let minutes = Math.floor((duration / (1000 * 60)) % 60);

    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;

    if (milliseconds < 10) {
      milliseconds = `00${milliseconds}`;
    } else if (milliseconds < 100) {
      milliseconds = `0${milliseconds}`;
    }

    return `${minutes}:${seconds}.${milliseconds}`;
  };

  if (telemetryData !== null) {
    return (
      <div id="timer" className="container">
        <p className="timer" id="time">
          {formatTime(time)}
        </p>
      </div>
    );
  }

  return <div id="timer" className="container" />;
}
