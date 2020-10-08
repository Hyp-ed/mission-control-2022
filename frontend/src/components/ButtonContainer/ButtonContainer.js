import {
  faRuler,
  faExclamationTriangle,
  faLock,
  faLockOpen,
  faSpinner,
  faForward,
  faRedo
} from "@fortawesome/free-solid-svg-icons";
import "./ButtonContainer.css";
import React, { useState, useEffect } from "react";
import Button from "../Button/Button";

export default props => {
  const [isMainDisabled, setMainDisabled] = useState(false);
  const state = props.state;
  
  const buttons = {
    calibrate: {
      caption: "CALIBRATE",
      icon: faRuler,
      slantedLeft: true,
      backgroundColor: "bg-blue-gradient",
      command: "CALIBRATE"
    },
    calibrating: {
      caption: "CALIBRATING",
      icon: faSpinner,
      spin: true,
      slantedLeft: true,
      backgroundColor: "bg-blue-gradient"
    },
    launch: {
      caption: "LAUNCH",
      icon: faForward,
      slantedLeft: true,
      backgroundColor: "bg-green-gradient",
      command: "LAUNCH"
    },
    abortRunning: {
      caption: "ABORT",
      icon: faExclamationTriangle,
      slantedLeft: true,
      slantedRight: true,
      backgroundColor: "bg-red-gradient",
      command: "STOP"
    },
    reset: {
      caption: "RESET",
      icon: faRedo,
      slantedLeft: true,
      backgroundColor: "bg-blue-gradient",
      command: "RESET"
    },
    extend: {
      caption: "EXTEND",
      icon: faLock,
      backgroundColor: "bg-white-gradient",
      command: "NOMINAL_BRAKING"
    },
    retract: {
      caption: "RETRACT",
      icon: faLockOpen,
      backgroundColor: "bg-white-gradient",
      command: "NOMINAL_RETRACT"
    },
    abort: {
      caption: "ABORT",
      icon: faExclamationTriangle,
      backgroundColor: "bg-white-gradient",
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
    console.log(state);
    setMainDisabled(false);
  }, [state]);

  const getButton = (button, disabled = false, hidden = false) => {
    return (
      <Button
        caption={button.caption}
        icon={button.icon}
        spin={button.spin}
        handleClick={() => {
          handleClick(button.command, disabled);
        }}
        slantedLeft={button.slantedLeft}
        slantedRight={button.slantedRight}
        backgroundColor={button.backgroundColor}
        disabled={disabled}
        hidden={hidden}
      ></Button>
    );
  };

  const getMainButton = () => {
    switch (state) {
      case "IDLE":
        return getButton(buttons.calibrate, isMainDisabled);
      case "CALIBRATING":
        return getButton(buttons.calibrating, true);
      case "READY":
        return getButton(buttons.launch, isMainDisabled);
      case "ACCELERATING":
        return getButton(buttons.abortRunning, isMainDisabled);
      case "EMERGENCY_BRAKING":
      case "NOMINAL_BRAKING":
        return getButton(buttons.abortRunning, true);
      case "RUN_COMPLETE":
      case "FINISHED":
      case "FAILURE_STOPPED":
        return getButton(buttons.reset, isMainDisabled);
    }
  };

  const getBrakeButton = () => {
    var hidden = true;
    switch (state) {
      case "IDLE":
      case "RUN_COMPLETE":
      case "FINISHED":
      case "FAILURE_STOPPED":
        hidden = false;
    }
    return getButton(
      props.isBrakeRetracted ? buttons.extend : buttons.retract,
      false,
      hidden
    );
  };

  const getAbortButton = () => {
    var hidden = true;
    switch (state) {
      case "IDLE":
      case "CALIBRATING":
      case "READY":
        hidden = false;
    }
    return getButton(buttons.abort, false, hidden);
  };

  return (
    <div className="button-container">
      {getMainButton()}
      {getBrakeButton()}
      {getAbortButton()}
    </div>
  );
};
