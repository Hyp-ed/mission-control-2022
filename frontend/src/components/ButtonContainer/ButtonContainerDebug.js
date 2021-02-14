import {
  faSpinner,
  faCogs,
  faPlay,
  faRedo,
  faCheck
} from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from "react";
import Button from "../Button/Button";

export default function ButtonContainerDebug(props) {
  const buttons = {
    loading: {
      caption: "LOADING",
      icon: faSpinner,
      spin: true,
      backgroundColor: "button-blue"
    },
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
      command: "RETRY"
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
    if (disabled || !props.stompClient) {
      return;
    }

    switch (command) {
      case "RUN":
        props.setModalOpen(true);
        break;
      case "COMPILE":
      case "RECOMPILE":
      case "RETRY":
        props.stompClient.send("/app/send/debug/compile", {}, command);
        break;
      default:
        break;
    }
  };

  const getButton = (button, disabled = false) => {
    return (
      <Button
        caption={button.caption}
        icon={button.icon}
        spin={button.spin}
        handleClick={() => {
          handleClick(button.command, disabled);
        }}
        backgroundColor={button.backgroundColor}
        disabled={disabled}
        key={button.caption}
      ></Button>
    );
  };

  const getDebugStatus = () => {
    console.log(props.debugStatus);
    switch(props.debugStatus) {
      case "COMPILING":
        return buttons.compiling;
      case "RECOMPILE":
        return buttons.compiled;
      case "RETRY":
        return buttons.retry;
      default:
        return buttons.loading;
    }
  }

  const getButtons = (isCompiled = false, isSuccess = false) => {
    let button = getDebugStatus();
    let isDisabled = (button === buttons.compiling || button === buttons.loading) ? true : false;

    if (!isSuccess){
      //Error handle state
      return [getButton(button, false, true)];
    }
    else if (!isCompiled){
      return [getButton(button, isDisabled, true)];
    }
    else {
      return [getButton(button, isDisabled, true), getButton(buttons.run, isDisabled, true)];
    }
  }

  return (
    <div className="button-container">
      {getButtons(props.debugData.isCompiled, props.debugData.isSuccess)}
    </div>
  );
};
