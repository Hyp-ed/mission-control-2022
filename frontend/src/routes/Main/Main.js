import React from "react";
import "./Main.css";
import GraphsContainer from "../../components/GraphsContainer/GraphsContainer";
import StatusContainer from "../../components/StatusContainer/StatusContainer";
import Terminal from "../../components/Terminal/Terminal";
import Timer from "../../components/Timer/Timer";
import Gauge from "../../components/Gauge/Gauge";
import DataContainer from "../../components/DataContainer/DataContainer";
import ButtonContainer from "../../components/ButtonContainer/ButtonContainer";

export default function Main(props) {
  return (
    <div className="gui-wrapper">
      <GraphsContainer />
      <StatusContainer />
      <Terminal
        terminalOutput={props.terminalOutput}
        logTypes={props.logTypes}
        submoduleTypes={props.submoduleTypes}
        stompClient={props.stompClient}
      />
      <Timer />
      <Gauge gaugeId="distance"/>
      <Gauge gaugeId="velocity"/>
      <Gauge gaugeId="acceleration"/>
      <DataContainer telemetryData={null}/>
      <ButtonContainer 
        stompClient={props.stompClient}
        state={props.state}
      />
    </div>
  );
}
