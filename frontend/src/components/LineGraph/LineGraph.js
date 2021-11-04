import "chartjs-plugin-streaming";
import "./LineGraph.css";

import React, { useEffect, useRef, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { capitalize, isEqual } from "lodash";
import { Line } from "react-chartjs-2";

import { getDataPointValue } from "../../DataTools";

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

const IGNORE_KEYS = ["additional_data", "crucial_data"];
const DELIMITER = " > ";

export default function LineGraph({ telemetryData, paths, ID, onSelectClicked }) {
  const [pathData, setPathData] = useState({});

  useDeepEffect(() => {
    setPathData((oldPathData) => {
      paths.forEach((path) => {
        const dataPoint = {
          x: telemetryData.time,
          y: getDataPointValue(telemetryData, path),
        };
        if (oldPathData.hasOwnProperty(path)) {
          // eslint-disable-next-line no-param-reassign
          oldPathData[path] = [...oldPathData[path], dataPoint];
        } else {
          // eslint-disable-next-line no-param-reassign
          oldPathData[path] = [dataPoint];
        }
      });
      return oldPathData;
    });
  }, [telemetryData]);

  const getLabel = (path) => {
    if (path.length === 1) {
      return path[0];
    }
    const parentKey = path[path.length - 2];
    const key = path[path.length - 1];
    if (IGNORE_KEYS.includes(parentKey)) {
      return capitalize(key);
    }
    return [parentKey, key].join(DELIMITER);
  };

  const getFormattedData = () => {
    return {
      datasets: Array.from(paths, (path, i) => {
        return {
          label: getLabel(path),
          data: pathData[path],
          borderColor: COLORS[(5 * ID + i) % COLORS.length], // shift and cycle colors
        };
      }),
    };
  };

  // const onCloseClicked = () => {
  //   props.removeGraph(props.ID);
  // };

  const onSelectClickedWrapper = () => {
    onSelectClicked(ID);
  };
  // Select data points
  return (
    <div id="graph-container">
      <div id="button-container">
        <FontAwesomeIcon />
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
        <span id="select-button" onClick={onSelectClickedWrapper} />
      </div>
      <div id="graph-wrapper">
        <Line data={getFormattedData} />
      </div>
    </div>
  );
}
