import "./ButtonContainer.css";

import React from "react";

import ButtonContainerDebug from "./ButtonContainerDebug";
import ButtonContainerTelemetry from "./ButtonContainerTelemetry";

export default function ButtonContainer(props) {
  // eslint-disable-next-line react/destructuring-assignment
  if (props.telemetryConnection) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <ButtonContainerTelemetry {...props} />;
  }

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <ButtonContainerDebug {...props} />;
}
