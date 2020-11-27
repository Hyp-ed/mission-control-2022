import React, { useState } from "react";
import "./Tabs.css";
import Button from "../Button/Button";
import {
  faTerminal,
  faChartBar,
  faProjectDiagram
} from "@fortawesome/free-solid-svg-icons";
import Terminal from "../Terminal/Terminal";
import Status from "../Status/Status";
import LineGraph from "../LineGraph/LineGraph";
import DataPointSelector from "../DataPointSelector/DataPointSelector";
import ConfigManager from "../../ConfigManager";
import Graphs from "../Graphs/Graphs";
import Sidebar from "../Sidebar/Sidebar";

export default function Tabs(props) {
  const [activeTabs, setActiveTabs] = useState([true, false, false]);
  const [currentGraph, setCurrentGraph] = useState(-1);

  const getGraphs = () => {
    //Uncomment for debugging purpose
    console.log(props.telemetryData);
    return Array.from(ConfigManager.getConfig().graphs, graph => (
      <LineGraph
        key={graph.ID}
        ID={graph.ID}
        paths={graph.paths ? graph.paths : []}
        removeGraph={path => ConfigManager.removeGraph(path, currentGraph)}
        telemetryData={props.telemetryData}
        onSelectClicked={setCurrentGraph}
      />
    ));
  };

  const handleUploadClick = () => {
    document.getElementById("fileButton").click();
    document.getElementById("fileButton").onchange = event => {
      const file = event.target.files[0];
      ConfigManager.parseConfig(file);
      event.target.value = null; // clear the input
    };
  };

  const handleSaveClick = () => {
    try {
      const str = ConfigManager.getConfigString();
      const url = window.URL.createObjectURL(new Blob([str]));
      const link = document.createElement("a");
      link.download = "myGraphConfig.json";
      link.href = url;
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

  const resetCurrentGraph = () => {
    setCurrentGraph(-1);
  };

  const handleDataPointClicked = path => {
    ConfigManager.handlePath(path, currentGraph);
  };

  const isSelected = path => {
    return ConfigManager.isPathSelected(path, currentGraph);
  };

  const handleTabClick = tabIndex => {
    var newTabArray = [false, false, false];
    newTabArray[tabIndex] = true;
    setActiveTabs(newTabArray);
  };

  const getBackgroundColor = isInactive => {
    if (isInactive) {
      return "bg-transparent";
    } else {
      return "bg-white";
    }
  };

  if (props.telemetryData != null) {
    return (
      <div className="tabs-root">
        <div className="tabs-container">
          <Button
            caption="TERMINAL"
            icon={faTerminal}
            handleClick={() => {
              handleTabClick(0);
              return;
            }}
            backgroundColor={getBackgroundColor(!activeTabs[0])}
          />
          <Button
            caption="GRAPHS"
            icon={faChartBar}
            handleClick={() => {
              handleTabClick(1);
              return;
            }}
            backgroundColor={getBackgroundColor(!activeTabs[1])}
          />
          <Button
            caption="STATUS"
            icon={faProjectDiagram}
            handleClick={() => {
              handleTabClick(2);
              return;
            }}
            backgroundColor={getBackgroundColor(!activeTabs[2])}
            slantedRight
          />
        </div>
        <div className="window-container">
          <Terminal
            isInactive={!activeTabs[0]}
            terminalOutput={props.terminalOutput}
            logTypes={props.logTypes}
            submoduleTypes={props.submoduleTypes}
            curStart={props.curStart}
            stompClient={props.stompClient}
          />
          {<Status isInactive={!activeTabs[2]} statusData={props.telemetryData.status_data}/>}
          <Graphs graphs={getGraphs()} isInactive={!activeTabs[1]}/>
          <Sidebar
            isInactive={!activeTabs[1]}
            handleAddGraphClick={ConfigManager.addGraph}
            isAddEnabled={ConfigManager.shouldEnableAdd()}
            handleSaveClick={handleSaveClick}
            handleUploadClick={handleUploadClick}
          ></Sidebar>
        </div>
        <DataPointSelector
          visible={currentGraph !== -1}
          telemetryData={props.telemetryData}
          onCloseClicked={resetCurrentGraph}
          onDataPointClicked={handleDataPointClicked}
          isSelected={isSelected}
        ></DataPointSelector>
      </div>
    );
  }
  else {
    return (<div className="tabs-root">
    <div className="tabs-container">
      <Button
        caption="TERMINAL"
        icon={faTerminal}
        handleClick={() => {
          handleTabClick(0);
          return;
        }}
        backgroundColor={getBackgroundColor(!activeTabs[0])}
      />
      <Button
        caption="GRAPHS"
        icon={faChartBar}
        handleClick={() => {
          handleTabClick(1);
          return;
        }}
        backgroundColor={getBackgroundColor(!activeTabs[1])}
      />
      <Button
        caption="STATUS"
        icon={faProjectDiagram}
        handleClick={() => {
          handleTabClick(2);
          return;
        }}
        backgroundColor={getBackgroundColor(!activeTabs[2])}
        slantedRight
      />
    </div>
    <div className="window-container">
    </div>
  </div>);
  }
}
