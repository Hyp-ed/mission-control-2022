import React from "react";

import { faCheck, faCogs, faPlay, faRedo, faSpinner } from "@fortawesome/free-solid-svg-icons";

import Button from "../Button/Button";

export default function ButtonContainerDebug(props) {
  const buttons = {
    loading: {
      caption: "LOADING",
      icon: faSpinner,
      spin: true,
      backgroundColor: "button-blue",
      disabled: true,
    },
    compile: {
      caption: "COMPILE",
      icon: faCogs,
      backgroundColor: "button-blue",
      command: "COMPILE",
      disabled: false,
    },
    compiling: {
      caption: "COMPILING",
      icon: faSpinner,
      spin: true,
      backgroundColor: "button-blue",
      disabled: true,
    },
    retry: {
      caption: "RETRY",
      icon: faRedo,
      backgroundColor: "button-red",
      command: "RETRY",
      disabled: false,
    },
    compiled: {
      caption: "RECOMPILE",
      icon: faCheck,
      backgroundColor: "button-green",
      command: "RECOMPILE",
      disabled: false,
    },
    run: {
      caption: "RUN",
      icon: faPlay,
      backgroundColor: "button-blue",
      command: "RUN",
      disabled: false,
    },
  };

  const handleClick = (command, disabled) => {
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
        props.setDebugStatus("COMPILING");
        break;
      default:
        break;
    }
  };

  const getButton = (button) => {
    return (
      <Button
        caption={button.caption}
        icon={button.icon}
        spin={button.spin}
        handleClick={() => {
          handleClick(button.command, button.disabled);
        }}
        backgroundColor={button.backgroundColor}
        disabled={button.disabled}
        key={button.caption}
      />
    );
  };

  const getDebugStatus = () => {
    switch (props.debugStatus) {
      case "COMPILE":
        return buttons.compile;
      case "COMPILING":
        return buttons.compiling;
      case "RECOMPILE":
        return buttons.compiled;
      case "RETRY":
        return buttons.retry;
      default:
        return buttons.loading;
    }
  };

  const getButtons = (isCompiled = false) => {
    const button = getDebugStatus();

    if (isCompiled) {
      return [getButton(button), getButton(buttons.run)];
    }

    return [getButton(button)];
  };

  // eslint-disable-next-line react/destructuring-assignment
  return <div className="button-container">{getButtons(props.debugData.isCompiled)}</div>;
}
