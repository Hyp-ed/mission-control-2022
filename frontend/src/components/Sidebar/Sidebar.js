import "./Sidebar.css";

import React from "react";

import { faFileImport, faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactTooltip from "react-tooltip";

const TOOLTIP_DELAY = 250;
const TOOLTIP_TEXT_COLOR = "#8f8f8f";

const Input = () => <input id="fileButton" type="file" hidden />;

const Button = ({ enabled, input, onClick, tooltip, icon }) =>
  enabled ? (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
    <div className="sidebar-icon" onClick={onClick} data-tip={tooltip}>
      {input ? <Input /> : <div />}
      <ReactTooltip effect="solid" delayShow={TOOLTIP_DELAY} textColor={TOOLTIP_TEXT_COLOR} place="left" />
      <FontAwesomeIcon icon={icon} />
    </div>
  ) : (
    <div />
  );

Button.defaultProps = { input: false, enabled: true };

export default function Sidebar({ isInactive, handleSaveClick, handleUploadClick }) {
  if (isInactive) {
    return null;
  }
  return (
    <div id="sidebar-container">
      <Button onClick={handleUploadClick} tooltip="Upload config" input icon={faFileImport} />
      <Button onClick={handleSaveClick} tooltip="Save config" icon={faSave} />
    </div>
  );
}
