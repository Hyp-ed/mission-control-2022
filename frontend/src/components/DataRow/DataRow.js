import "./DataRow.css";

import React from "react";

import { Textfit } from "react-textfit";

export default function DataRow({ data }) {
  const range = (data.max - data.min) / 0.8;
  const realMin = data.min - range * 0.1;
  const realMax = data.max + range * 0.1;
  const value = Math.max(Math.min(data.value, realMax), realMin);
  const percentage = ((value - realMin) / range) * 100;

  return (
    <div className="data-row">
      <Textfit mode="single" forceSingleModeWidth={false} max={14} className="data-row-name">
        {data.name}
      </Textfit>
      <div className="data-row-bar">
        <div
          className={`progress-bar ${percentage > 90 || percentage < 10 ? " progress-bar-red" : "progress-bar-white"}`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
      <Textfit mode="single" forceSingleModeWidth={false} max={14} className="data-row-value">
        {`${data.value.toFixed(1)} ${data.unit}`}
      </Textfit>
    </div>
  );
}
