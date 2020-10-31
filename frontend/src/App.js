import React, { useState, useEffect } from "react";
import { MemoryRouter, Switch, Route, Link } from "react-router-dom";
import { createMemoryHistory } from "history";
import Stomp from "stompjs";
import Home from "./routes/Home/Home";
import Main from "./routes/Main/Main";
import Disconnected from "./routes/Disconnected/Disconnected";
import Loading from "./routes/Loading/Loading";
import Setup from "./routes/Setup/Setup";
import testData from "./testData.json";

export default function App() {
  const [stompClient, setStompClient] = useState(null);
  const [telemetryConnection, setTelemetryConnection] = useState(false);
  const [telemetryData, setTelemetryData] = useState(null); // change to testData for testing
  const [debugConnection, setDebugConnection] = useState(false);
  const [debugStatus, setDebugStatus] = useState(false);
  const [debugError, setDebugError] = useState(null);
  const [terminalOutput, setTerminalOutput] = useState("");

  useEffect(() => {
    const sc = Stomp.client("ws://localhost:8080/connecthere");
    sc.debug = false;
    setStompClient(sc);
    sc.connect(
      {},
      frame => {
        sc.subscribe("/topic/telemetry/data", message =>
          telemetryDataHandler(message)
        );
        sc.subscribe("/topic/telemetry/connection", message =>
          telemetryConnectionHandler(message)
        );
        sc.subscribe("/topic/debug/output", message =>
          terminalOutputHandler(message)
        );
        sc.subscribe("/topic/debug/connection", message =>
          debugConnectionHandler(message)
        );
        sc.subscribe("/topic/debug/status", message =>
          debugStatusHandler(message)
        );
        sc.subscribe("/topic/debug/error", message =>
          debugErrorHandler(message)
        );
        sc.subscribe("/topic/errors", message =>
          console.error(`ERROR FROM BACKEND: ${message}`)
        );
      },
      error => disconnectHandler(error)
    );
  }, []); // Only run once

  const telemetryConnectionHandler = message => {
    setTelemetryConnection(message.body === "CONNECTED" ? true : false);
  };

  const debugConnectionHandler = message => {
    setDebugConnection(message.body === "CONNECTED" ? true : false);
  };

  const telemetryDataHandler = message => {
    setTelemetryData(JSON.parse(message.body));
  };

  const terminalOutputHandler = message => {
    setTerminalOutput(JSON.parse(message.body));
  };

  const debugStatusHandler = message => {
    setDebugStatus(message.body);
  };

  const debugErrorHandler = message => {
    setDebugError(message.body);
  };

  const disconnectHandler = error => {
    if (error.startsWith("Whoops! Lost connection")) {
      setTelemetryConnection(false);
      console.error("DISCONNECTED FROM BACKEND");
    } else {
      console.error(error);
    }
  };

  var state = "";
  if (telemetryData !== null) {
    state = telemetryData.crucial_data.find(o => o.name === "status").value;
  }

  // temporary solution to the timer, it should actually come from the pod side
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  useEffect(() => {
    if (state == "CALIBRATING") {
      setStartTime(0);
      setEndTime(0);
    } else if (state == "ACCELERATING" && startTime == 0) {
      setStartTime(Date.now());
    } else if (
      (state == "RUN_COMPLETE" || state == "FAILURE_STOPPED") &&
      endTime == 0
    ) {
      setEndTime(Date.now());
    }
  }, [state]);

  const history = createMemoryHistory();
  return (
    <MemoryRouter history={history}>
      <Switch>
        <Route
          path="/main"
          render={props => (
            <Main
              stompClient={stompClient}
              telemetryConnection={telemetryConnection}
              telemetryData={telemetryData}
              debugConnection={debugConnection}
              terminalOutput={terminalOutput}
              state={state}
              startTime={startTime}
              endTime={endTime}
            />
          )}
        ></Route>
        <Route
          path="/loading"
          render={props => (
            <Loading
              stompClient={stompClient}
              debugStatus={debugStatus}
              debugError={debugError}
              debugConnection={debugConnection}
            />
          )}
        ></Route>
        <Route path="/disconnected" render={props => <Disconnected />}></Route>
        <Route
          path="/setup"
          render={props => (
            <Setup
              stompClient={stompClient}
              debugConnection={debugConnection}
              debugStatus={debugStatus}
            />
          )}
        ></Route>
        <Route path="/" render={props => <Home />}></Route>
      </Switch>
    </MemoryRouter>
  );
}
