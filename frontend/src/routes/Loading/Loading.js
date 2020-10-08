import React, { useState, useEffect } from "react";
import {
  faArrowAltCircleLeft,
  faSpinner,
  faExclamationTriangle,
  faCheck
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useHistory } from "react-router-dom";
import SetupLogo from "../SetupLogo/SetupLogo";
import Button from "../../components/Button/Button";
import "./Loading.css";
import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";

export default function Loading(props) {
  const history = useHistory();
  const handleGoBackClick = () => {
    props.stompClient.send("/app/send/debug/reset", {}, {});
    history.push("/setup");
  };

  const getMessage = () => {
    switch (props.debugStatus) {
      case "COMPILING":
        return [
          <FontAwesomeIcon
            className="icon"
            icon={faSpinner}
            spin={true}
          ></FontAwesomeIcon>,
          "Compiling..."
        ];
      case "COMPILED":
        return [
          <FontAwesomeIcon
            className="icon success"
            icon={faCheck}
          ></FontAwesomeIcon>,
          "Compiled. Starting the binary..."
        ];
      case "COMPILING_FAILED":
        return [
          <FontAwesomeIcon
            className="icon alert"
            icon={faExclamationTriangle}
          ></FontAwesomeIcon>,
          "Compiling failed",
          <div className="terminal-root">
            <SimpleBar
              className="terminal-content"
              forceVisible="y"
              autoHide={false}
            >
              <pre id="terminal_pre">{props.debugError}</pre>
            </SimpleBar>
          </div>,
          <Button
          caption="GO BACK"
          handleClick={handleGoBackClick}
          backgroundColor="bg-white-gradient"
          icon={faArrowAltCircleLeft}
        ></Button>
        ];
      default:
        return;
    }
  };

  useEffect(() => {
    if (props.debugStatus == "RUNNING") {
      history.push("/main");
    }
  }, [props.debugStatus]);

  return (
    <div className="loading-wrapper centered">
      <SetupLogo></SetupLogo>
      <div className="loading-wrapper-content">{getMessage()}</div>
    </div>
  );
}
