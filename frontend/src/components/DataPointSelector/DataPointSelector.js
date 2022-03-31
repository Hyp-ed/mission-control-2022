import React, { useEffect, useState } from "react";
import "./DataPointSelector.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { getAllPaths } from "../../DataTools";
import SimpleBar from "simplebar-react";
import CONSTANTS from "../../constants.json";
import "simplebar/dist/simplebar.min.css";

export default function DataPointSelector(props) {
  const getPathList = () => {
    // const paths = ;
    return CONSTANTS.graphable_paths
      .filter((path) => path !== undefined)
      .map((path, i) => (
        <div
          key={i}
          onClick={() => props.onDataPointClicked(path.path)}
          className={["dataPoint", props.isSelected(path.path) ? "dataPoint--selected" : ""].join(" ")}
          // onClick={}
        >
          {path.caption}
        </div>
      ));
  };

  //<div id="list">{getPathList()}</div>

  return props.visible ? (
    <div id="list-container">
      <FontAwesomeIcon id="list-close-button" onClick={props.onCloseClicked} icon={faTimes} />

      <SimpleBar className="list-bar" forceVisible="x" autoHide={false}>
        <div id="list">{getPathList()}</div>
      </SimpleBar>
    </div>
  ) : (
    <div />
  );
}
