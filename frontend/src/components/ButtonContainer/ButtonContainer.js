import {
  faRuler,
  faExclamationTriangle,
  faSpinner,
  faForward,
  faPowerOff,
  faCogs,
  faPlay,
  faRedo,
  faCheck
} from "@fortawesome/free-solid-svg-icons";
import "./ButtonContainer.css";
import React, { useState, useEffect } from "react";
import Button from "../Button/Button";

export default props => {
  const [isMainDisabled, setMainDisabled] = useState(false);
  
  const telemetry_buttons = {
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

  const debug_buttons = {
    compile: {
      caption: "COMPILE",
      icon: faCogs,
      backgroundColor: "button-blue",
      command: "COMPILE"
    },
    compiling: {
      caption: "COMPILING",
      icon: faSpinner,
      spin: true,
      backgroundColor: "button-blue"
    },
    retry: {
      caption: "RETRY",
      icon: faRedo,
      backgroundColor: "button-red",
      command: "COMPILE"
    },
    compiled: {
      caption: "RECOMPILE",
      icon: faCheck,
      backgroundColor: "button-green",
      command: "RECOMPILE"
    },
    run: {
      caption: "RUN",
      icon: faPlay,
      backgroundColor: "button-blue",
      command: "RUN"
    },
  };

  const handleClick = (command, disabled, debug = false) => {
    if (disabled) {
      return;
    }
    setMainDisabled(true);

    if (debug) {
      switch (command) {
        case "RUN":
          props.setModalOpen(true);
          break;
        case "COMPILE":
        case "RECOMPILE":
          props.stompClient.send("/app/send/debug/compileRun", {}, command);
          break;
      }
    }
    else if (props.stompClient) {
      props.stompClient.send("/app/send/telemetry/command", {}, command);
      console.log("Sent command: " + command);
    }
  };

  useEffect(() => {
    setMainDisabled(false);
  }, [props.state]);

  const getButton = (button, disabled = false, debug = false) => {
    return (
      <Button
        id={button.id}
        caption={button.caption}
        icon={button.icon}
        spin={button.spin}
        handleClick={() => {
          handleClick(button.command, disabled, debug);
        }}
        backgroundColor={button.backgroundColor}
        disabled={disabled}
      ></Button>
    );
  };

  const getMainButton = () => {
    switch (props.state) {
      case "IDLE":
        return getButton(telemetry_buttons.calibrate, isMainDisabled);
      case "CALIBRATING":
        return getButton(telemetry_buttons.calibrating, true);
      case "READY":
        return getButton(telemetry_buttons.launch, isMainDisabled);
      case "ACCELERATING":
      case "EMERGENCY_BRAKING":
      case "NOMINAL_BRAKING":
        return null;
      case "FINISHED":
      case "FAILURE_STOPPED":
        return getButton(telemetry_buttons.shutdown, isMainDisabled);
    }
  };

  const getAbortButton = () => {
    switch (props.state) {
      case "IDLE":
      case "CALIBRATING":
      case "READY":
      case "ACCELERATING":
      case "NOMINAL_BRAKING":
        return getButton(telemetry_buttons.abort, isMainDisabled);
      case "EMERGENCY_BRAKING":
        return getButton(telemetry_buttons.abort, true);
      case "FINISHED":
      case "FAILURE_STOPPED":
        return null;
    }
  };

  // TODO(Steven): implement all the states of compile button
  const getDebugButtons = (isCompiled) => {
    if(!isCompiled){
      return [getButton(debug_buttons.compile, false, true)];
    }
    return [getButton(debug_buttons.compiled, false, true), getButton(debug_buttons.run, false, true)];
  }

  if (props.telemetryConnection) {
    return (
      <div className="button-container">
        {getAbortButton()}
        {getMainButton()}
      </div>
    );
  }
  else {
    return (
      <div className="button-container">
        {getDebugButtons(props.compileStatus)}
      </div>
    );
  }
  
};
