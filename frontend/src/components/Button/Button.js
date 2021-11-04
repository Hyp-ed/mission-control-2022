import "./Button.css";

import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Button({ backgroundColor, handleClick, icon, spin, caption, disabled }) {
  const getClassNames = (bgColor) => {
    const classes = ["button"];

    if (disabled) {
      classes.push("disabled");
    }
    classes.push(bgColor);

    return classes.join(" ");
  };

  return (
    <button type="button" className={getClassNames(backgroundColor)} onClick={handleClick}>
      <FontAwesomeIcon className="button-icon" icon={icon} spin={spin} />
      {caption}
    </button>
  );
}
