import React from "react";
import "./Gauge.css";

export default props => {
  // TODO: adapt gauges to the new design
  return(<div id={"gauge-" + props.gaugeId} class="container"></div>);
}

