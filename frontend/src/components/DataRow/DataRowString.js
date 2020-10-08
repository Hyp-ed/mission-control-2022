import React from "react";
import "./DataRow.css";
import { Textfit } from "react-textfit";

export default props => {
  return (
    <div className="data-row-container">
      {props.level > 0 ? <div className="data-row-line"></div> : ""}
      <div className={"data-row " + (props.level > 0 ? "next" : "")}>
        <Textfit
          mode="single"
          forceSingleModeWidth={false}
          max={16}
          className="data-row-name"
        >
          {props.data.name}
        </Textfit>
        <Textfit
          mode="single"
          forceSingleModeWidth={false}
          max={16}
          className="data-row-value data-row-value-string"
        >
          {props.data.value}
        </Textfit>
      </div>
    </div>
  );
};
