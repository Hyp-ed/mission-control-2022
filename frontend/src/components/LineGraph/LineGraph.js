import React, { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import "chartjs-plugin-streaming";
import "./LineGraph.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { isEqual } from "lodash";
import CONSTANTS from "../../constants.json";

const COLORS = [
  "#BF000B", // dark red
  "#009AB0", // blue
  "#FF9B00", // yellow
  "#FFFFFF", // white
  "#A7CEE3", // aqua
  "#1F79B4", // pink
  "#CAB3D7", // violet
  "#FF7F02", // orange
  "#6B3D9A", // purple
  "#B15928", // brown
  "#4BBEBE", // green
];

/**
 * Effect hook that deep compares objects in the dependency array
 */
const useDeepEffect = (fn, deps) => {
  const isFirst = useRef(true);
  const prevDeps = useRef(deps);

  useEffect(() => {
    const isSame = prevDeps.current.every((obj, index) => isEqual(obj, deps[index]));

    if (isFirst.current || !isSame) {
      fn();
    }

    isFirst.current = false;
    prevDeps.current = deps;
  }, [fn, deps]);
};

const getValueFromPath = (telemetryData, path) => path.split(".").reduce((a, v) => a[v], telemetryData);

export default function LineGraph(props) {
  const [pathData, setPathData] = useState({});

  useDeepEffect(() => {
    setPathData((oldPathData) => {
      props.paths.forEach((path) => {
        const dataPoint = {
          x: props.telemetryData.time,
          y: getValueFromPath(props.telemetryData, path),
        };
        if (oldPathData.hasOwnProperty(path)) {
          oldPathData[path] = [...oldPathData[path], dataPoint];
        } else {
          oldPathData[path] = [dataPoint];
        }
      });
      return oldPathData;
    });
  }, [props.telemetryData]);

  const getFormattedData = () => {
    return {
      datasets: Array.from(props.paths, (path, i) => {
        return {
          label: CONSTANTS.graphable_paths.find((p) => p.path === path).caption,
          data: pathData[path],
          borderColor: COLORS[(5 * props.ID + i) % COLORS.length], // shift and cycle colors
        };
      }),
    };
  };

  // const onCloseClicked = () => {
  //   props.removeGraph(props.ID);
  // };

  const onSelectClicked = () => {
    props.onSelectClicked(props.ID);
  };
  //Select data points
  return (
    <div id="graph-container">
      <div id="button-container">
        <FontAwesomeIcon />
        <span id="select-button" onClick={onSelectClicked}></span>
      </div>
      <div id="graph-wrapper">
        <Line data={getFormattedData} />
      </div>
    </div>
  );
}
