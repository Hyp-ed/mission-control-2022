import "./DataPointSelector.css";
import "simplebar/dist/simplebar.min.css";

import React, { useEffect, useState } from "react";

import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SimpleBar from "simplebar-react";

import { getAllPaths } from "../../DataTools";

export default function DataPointSelector({ telemetryData, onDataPointClicked, isSelected, onCloseClicked, visible }) {
  const [paths, setPaths] = useState();

  useEffect(() => {
    setPaths(getAllPaths(telemetryData));
  }, [telemetryData]);

  const getPathList = () => {
    // const paths = ;
    return paths
      .filter((path) => path !== undefined)
      .map((path, i) => (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          onClick={() => onDataPointClicked(path.path)}
          className={["dataPoint", isSelected(path.path) ? "dataPoint--selected" : ""].join(" ")}
          // onClick={}
        >
          {path.caption}
        </div>
      ));
  };

  // <div id="list">{getPathList()}</div>

  return visible ? (
    <div id="list-container">
      <FontAwesomeIcon id="list-close-button" onClick={onCloseClicked} icon={faTimes} />

      <SimpleBar className="list-bar" forceVisible="x" autoHide={false}>
        <div id="list">{getPathList()}</div>
      </SimpleBar>
    </div>
  ) : (
    <div />
  );
}
