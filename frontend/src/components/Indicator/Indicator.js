import React from "react";
import "./Indicator.css";

export default function Indicator(props) {
  
  const indicatorStyle = () => {
    var indicatorStyle = ["indicator"]
    indicatorStyle.push(props.enabled ? "indicator-enabled" : "indicator-disabled");
    indicatorStyle.push(props.brake ? "brake" : "")
    return indicatorStyle.join(" ");
  }

  const textStyle = props.brake ? "caption brake" : "caption";

  return (
    <div className={indicatorStyle()}>
      <div className={textStyle}>{props.caption}</div>
    </div>
  );
}
