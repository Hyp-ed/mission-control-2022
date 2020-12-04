import React from "react";
import "./DataRow.css";
import { Textfit } from "react-textfit";

export default props => {
  const range = (props.data.max - props.data.min) / 0.8;
  const realMin = props.data.min - range * 0.1;
  const realMax = props.data.max + range * 0.1;
  const value = Math.max(Math.min(props.data.value, realMax), realMin);
  const percentage = ((value - realMin) / range) * 100;

  return (
    <div>
      <div className={"data-row"}>
        <Textfit
          mode="single"
          forceSingleModeWidth={false}
          max={14}
          className="data-row-name"
        >
          {props.data.name}
        </Textfit>
        <div
          className={
            "data-row-bar" +
            (percentage > 90 || percentage < 10 ? " alert" : "")
          }
        >
          <div
            className={"progress-bar " + (percentage > 90 || percentage < 10 ? " bg-red-gradient" : "bg-white-gradient")}
            style={{
              width: percentage + "%"
            }}
          ></div>
        </div>
        <Textfit
          mode="single"
          forceSingleModeWidth={false}
          max={14}
          className="data-row-value"
        >
          {props.data.value.toFixed(1) + " " + props.data.unit}
        </Textfit>
      </div>
    </div>
  );
};
