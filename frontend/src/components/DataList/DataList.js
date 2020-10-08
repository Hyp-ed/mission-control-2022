import React, { useState } from "react";
import "./DataList.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretUp, faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { Collapse } from "react-collapse";

export default props => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className={"data-list " + (props.level > 0 ? "next" : "")}>
      <div className="data-list-header" onClick={() => setIsOpen(!isOpen)}>
        {props.level > 0 && <div className="data-list-header-line"></div>}
        <div className="data-list-header-content">
          <div className="data-list-header-content-title">{props.title}</div>
          <FontAwesomeIcon
            className="data-list-header-content-caret"
            icon={isOpen ? faCaretUp : faCaretDown}
          ></FontAwesomeIcon>
        </div>
      </div>
      <Collapse theme={{collapse: "data-list-body-collapse", content: "data-list-body-content"}} isOpened={isOpen}>
        {props.value}
      </Collapse>
    </div>
  );
};
