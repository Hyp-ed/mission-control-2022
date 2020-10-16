import React from "react";
import "./Indicator.css";

export default function Indicator(props) {
  
  const indicatorStyle = () => {
    var indicatorStyle = ["indicator"]
    indicatorStyle.push(props.enabled ? "indicator-enabled" : "indicator-disabled");
    indicatorStyle.push(props.brake ? "brake" : "")

    //For the MODULES only
    switch (props.status) {
      case 'START':
        indicatorStyle.push("indicator-start");
        break;
      case 'READY':
        indicatorStyle.push("indicator-ready");
        break;
      case 'INIT':
        indicatorStyle.push("indicator-init");
        break;
      case 'CRITICAL_FAILURE':
        indicatorStyle.push("indicator-fail");
        break;
      //When there is no status data
      default:
        indicatorStyle = indicatorStyle 
    }

    return indicatorStyle.join(" ");
  }

  const textStyle = props.brake ? "caption brake" : "caption";

  return (
    <div className={indicatorStyle()}>
      <div className={textStyle}>{props.caption}</div>
    </div>
  );
}
