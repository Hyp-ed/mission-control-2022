import "./DataList.css";

import React, { useState } from "react";

import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Collapse } from "react-collapse";

export default function DataList({ title, value }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
      <div className="data-list-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="data-list-header-content">
          <div className="data-list-header-content-title">{title}</div>
          <FontAwesomeIcon className="data-list-header-content-caret" icon={isOpen ? faCaretDown : faCaretUp} />
        </div>
      </div>
      <Collapse theme={{ collapse: "data-list-body-collapse", content: "data-list-body-content" }} isOpened={isOpen}>
        {value}
      </Collapse>
    </div>
  );
}
