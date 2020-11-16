import {
  faRuler,
  faExclamationTriangle,
  faSpinner,
  faForward,
  faPowerOff
} from "@fortawesome/free-solid-svg-icons";
import "./ButtonContainer.css";
import React, { useState, useEffect } from "react";
import Button from "../Button/Button";

export default props => {
  const [isMainDisabled, setMainDisabled] = useState(false);
  
  const buttons = {
    calibrate: {
      caption: "CALIBRATE",
      icon: faRuler,
      backgroundColor: "button-blue-pulse",
      command: "CALIBRATE"
    },
    calibrating: {
      caption: "CALIBRATING",
      icon: faSpinner,
      spin: true,
      backgroundColor: "button-blue"
    },
    launch: {
      id: "button-launch",
      caption: "LAUNCH",
      icon: faForward,
      backgroundColor: "button-green-pulse",
      command: "LAUNCH"
    },
    shutdown: {
      caption: "SHUTDOWN",
      icon: faPowerOff,
      backgroundColor: "button-red",
      command: "SHUTDOWN"
    },
    abort: {
      caption: "ABORT",
      icon: faExclamationTriangle,
      backgroundColor: "button-red",
      command: "STOP"
    }
  };

  const handleClick = (command, disabled) => {
    if (disabled) {
      return;
    }

    setMainDisabled(true);
    if (props.stompClient) {
      props.stompClient.send("/app/send/telemetry/command", {}, command);
      console.log("Sent command: " + command);
    }
  };

  useEffect(() => {
    console.log(props.state)
    setMainDisabled(false);
  }, [props.state]);

  const getButton = (button, disabled = false) => {
    return (
      <Button
        id={button.id}
        caption={button.caption}
        icon={button.icon}
        spin={button.spin}
        handleClick={() => {
          handleClick(button.command, disabled);
        }}
        backgroundColor={button.backgroundColor}
        disabled={disabled}
      ></Button>
    );
  };

  const getMainButton = () => {
    switch (props.state) {
      case "IDLE":
        return getButton(buttons.calibrate, isMainDisabled);
      case "CALIBRATING":
        return getButton(buttons.calibrating, true);
      case "READY":
        return getButton(buttons.launch, isMainDisabled);
      case "ACCELERATING":
      case "EMERGENCY_BRAKING":
      case "NOMINAL_BRAKING":
        return null;
      case "FINISHED":
      case "FAILURE_STOPPED":
        return getButton(buttons.shutdown, isMainDisabled);
    }
  };

  const getAbortButton = () => {
    switch (props.state) {
      case "IDLE":
      case "CALIBRATING":
      case "READY":
      case "ACCELERATING":
      case "NOMINAL_BRAKING":
        return getButton(buttons.abort, isMainDisabled);
      case "EMERGENCY_BRAKING":
        return getButton(buttons.abort, true);
      case "FINISHED":
      case "FAILURE_STOPPED":
        return null;
    }
  };

  return (
    <div className="button-container">
      {getAbortButton()}
      {getMainButton()}
    </div>
  );
};
