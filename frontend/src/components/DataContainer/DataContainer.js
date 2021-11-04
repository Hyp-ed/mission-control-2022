import "./DataContainer.css";
import "simplebar/dist/simplebar.min.css";

import React from "react";

import SimpleBar from "simplebar-react";

import DataList from "../DataList/DataList";
import DataRow from "../DataRow/DataRow";

export default function DataContainer({ telemetryData }) {
  const dataList = {};

  const combine = (title, data) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const list of Object.values(data)) {
      if (Array.isArray(list.value)) {
        combine(title.concat([list.name]), list.value);
      } else {
        if (title.join(" > ") in dataList === false) {
          dataList[title.join(" > ")] = [];
        }
        dataList[title.join(" > ")].push(list);
      }
    }
  };

  const getListItems = (list) => {
    return list.map((data) => {
      return <DataRow data={data} key={data.name} />;
    });
  };

  const getFormattedLists = () => {
    const response = [];
    // eslint-disable-next-line no-restricted-syntax,guard-for-in
    for (const title in dataList) {
      response.push(<DataList title={title} value={getListItems(dataList[title])} key={title} />);
    }
    return response;
  };

  if (telemetryData !== null) {
    combine([], telemetryData.additional_data);

    return (
      <SimpleBar className="data-container" forceVisible="y" autoHide={false}>
        {getFormattedLists()}
      </SimpleBar>
    );
  }

  return <div className="data-container container" />;
}
