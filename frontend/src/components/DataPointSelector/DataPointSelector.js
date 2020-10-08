import React, { useEffect, useState } from "react";
import "./DataPointSelector.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { getAllPaths } from "../../DataTools";

export default function DataPointSelector(props) {
  const [paths, setPaths] = useState();

  useEffect(() => {
    setPaths(getAllPaths(props.telemetryData));
  }, []);

  const getPathList = () => {
    // const paths = ;
    return paths
      .filter(path => path !== undefined)
      .map((path, i) => (
        <div
          key={i}
          onClick={() => props.onDataPointClicked(path.path)}
          className={[
            "dataPoint",
            props.isSelected(path.path) ? "dataPoint--selected" : ""
          ].join(" ")}
          // onClick={}
        >
          {path.caption}
        </div>
      ));
  };

  return props.visible ? (
    <div id="list-container">
      <FontAwesomeIcon
        id="list-close-button"
        onClick={props.onCloseClicked}
        icon={faTimes}
      />
      <div id="list">{getPathList()}</div>
    </div>
  ) : (
    <div />
  );
}
