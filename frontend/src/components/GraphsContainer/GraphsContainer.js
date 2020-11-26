import React, {useState} from "react";
import "./GraphsContainer.css";
import DataPointSelector from "../DataPointSelector/DataPointSelector";
import ConfigManager from "../../ConfigManager";
import Sidebar from "../Sidebar/Sidebar";
import LineGraph from "../LineGraph/LineGraph"
import { defaults } from "react-chartjs-2";

export default props => {
    const accentColor = "#8F8F8F";

    const setGraphDefaults = () => {
    defaults.global.animation = false;
    defaults.global.elements.point.radius = 0;
    defaults.global.defaultFontFamily = "Roboto Mono";
    defaults.global.defaultFontColor = accentColor;
    defaults.global.tooltips.enabled = false;
    defaults.global.maintainAspectRatio = false;
    defaults.global.responsive = true;
    defaults.global.elements.line.tension = 0;
    defaults.global.elements.line.borderWidth = 1.5;
    defaults.global.elements.line.fill = false;
    defaults.global.plugins.streaming.frameRate = 60;
    defaults.line.scales.xAxes[0] = {
        realtime: {
        ttl: undefined // automatically delete data after it disappears off the graph
        },
        ticks: { display: false },
        gridLines: { display: false },
        type: "time",
        time: { parser: "DD/MM/YYYY" }
    };
    defaults.line.scales.yAxes[0] = {
        gridLines: {
        color: accentColor,
        zeroLineColor: accentColor // x-axis color
        }
    };
    };
    setGraphDefaults();


    const [currentGraph, setCurrentGraph] = useState(-1);

    const getGraphs = () => {
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

    // TODO: adapt graphs to a new design
    //return (<div id="graphs-container" class="container"></div>);
    return (
        <div id="graphs-container" class="container">
          <div id="all">
            <div id="graphs">
              {getGraphs()}
            </div>
            <Sidebar
                id="sidebar"
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