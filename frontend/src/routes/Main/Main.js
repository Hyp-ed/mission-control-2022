import React, { useState, useEffect } from "react";
import "./Main.css";
import ButtonContainer from "../../components/ButtonContainer/ButtonContainer";
import Header from "../../components/Header/Header";
import DataContainer from "../../components/DataContainer/DataContainer";
import Tabs from "../../components/Tabs/Tabs";
import GaugeContainer from "../../components/GaugeContainer/GaugeContainer";

export default function Main(props) {
  return (
    <div className="gui-wrapper">
      <Header
        telemetryConnection={props.telemetryConnection}
        telemetryData={props.telemetryData}
        debugConnection={props.debugConnection}
        baseStationConnection={props.stompClient.connected}
        startTime={props.startTime}
        endTime={props.endTime}
        state={props.state}
      />
      <ButtonContainer
        stompClient={props.stompClient}
        telemetryData={props.telemetryData}
        state={props.state}
      ></ButtonContainer>
      <DataContainer telemetryData={props.telemetryData}></DataContainer>
      <GaugeContainer telemetryData={props.telemetryData}></GaugeContainer>
      <Tabs
        telemetryData={props.telemetryData}
        terminalOutput={props.terminalOutput}
        stompClient={props.stompClient}
      />
    </div>
  );
}
