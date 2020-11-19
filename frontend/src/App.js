import React, { useState, useEffect } from "react";
import Stomp from "stompjs";
import GraphsContainer from "./components/GraphsContainer/GraphsContainer";
import StatusContainer from "./components/StatusContainer/StatusContainer";
import Terminal from "./components/Terminal/Terminal";
import Timer from "./components/Timer/Timer";
import Gauge from "./components/Gauge/Gauge";
import DataContainer from "./components/DataContainer/DataContainer";
import ButtonContainer from "./components/ButtonContainer/ButtonContainer";
import SetupModal from "./components/SetupModal/SetupModal";
import testData from "./testData.json";

export default function App() {
  const [stompClient, setStompClient] = useState(null);
  const [telemetryConnection, setTelemetryConnection] = useState(false);
  const [telemetryData, setTelemetryData] = useState(null); // change to testData for testing
  const [debugConnection, setDebugConnection] = useState(false);
  const [debugStatus, setDebugStatus] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState("");
  const [logTypes, setLogTypes] = useState([""])
  const [submoduleTypes, setSubmoduleTypes] = useState([""])
  const [isModalOpen, setModalOpen] = useState(false);

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
    var jsonObj = JSON.parse(message.body)
    setTerminalOutput(JSON.parse(jsonObj.terminalOutput))
    setLogTypes(jsonObj.logTypes)
    setSubmoduleTypes(jsonObj.submoduleTypes)
  };

  const debugStatusHandler = message => {
    setDebugStatus(message.body);
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
      setStartTime(telemetryData.time);
    } else if (
      (state == "RUN_COMPLETE" || state == "FAILURE_STOPPED") &&
      endTime == 0
    ) {
      setEndTime(telemetryData.time);
    }
  }, [state]);

  return (
    <div className="gui-wrapper">
      <GraphsContainer />
      <StatusContainer />
      <Terminal
        terminalOutput={terminalOutput}
        logTypes={logTypes}
        submoduleTypes={submoduleTypes}
        stompClient={stompClient}
      />
      <Timer />
      <Gauge gaugeId="distance"/>
      <Gauge gaugeId="velocity"/>
      <Gauge gaugeId="acceleration"/>
      <DataContainer telemetryData={null}/>
      <ButtonContainer 
        stompClient={stompClient}
        telemetryConnection={telemetryConnection}
        state={state}
        setModalOpen={setModalOpen}
      />
      <SetupModal stompClient={stompClient} isModalOpen={isModalOpen} setModalOpen={setModalOpen}></SetupModal>
    </div>
  );
}
