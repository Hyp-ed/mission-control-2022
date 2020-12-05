import React from "react";
import "./DataContainer.css";
import DataRow from "../DataRow/DataRow";
import DataList from "../DataList/DataList";
import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";

export default props => {
  var dataList = {};

  const combine = (title, data) => {
    data.map((list, i) => {
      if (Array.isArray(list.value)) {
        combine(title.concat([list.name]), list.value);
      }
      else {
        if (title.join(" > ") in dataList === false) {
          dataList[title.join(" > ")] = [];
        }
        dataList[title.join(" > ")].push(list);
      }
    });
  }

  const getListItems = (list) => {
    var response = []
    list.map((data, i) => {
      response.push(<DataRow data={data}></DataRow>);
    });
    return response;
  }

  const getFormattedLists = () => {
    var response = []
    for (var title in dataList) {
      response.push(
        <DataList
          title={title}
          value={getListItems(dataList[title])}
        ></DataList>
      )
    }
    return response;
  }

  if (props.telemetryData !== null) {
    combine([], props.telemetryData.additional_data);
    
    return (
      <SimpleBar className="data-container" forceVisible="y" autoHide={false}>
        {getFormattedLists()}
      </SimpleBar>
    );
  }
  else {
    return (<SimpleBar className="data-container" forceVisible="y" autoHide={false}></SimpleBar>);
  }  
};
