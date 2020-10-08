import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Button.css";

export default function Button(props) {
  const getClassNames = backgroundColor => {
    var classes = ["button"];

    if (props.slantedLeft && props.slantedRight) {
      classes.push("button-slant-both");
    } else if (props.slantedLeft) {
      classes.push("button-slant-left");
    } else if (props.slantedRight) {
      classes.push("button-slant-right");
    }

    if (props.disabled) {
      classes.push("disabled");
    }

    if (props.hidden) {
      classes.push("hidden");
    }

    classes.push(backgroundColor);

    return classes.join(" ");
  };

  if (props.hidden) {
    return (
      <div
        className={getClassNames(props.backgroundColor)}
      ></div>
        );
  }

  return (
    <button
      className={getClassNames(props.backgroundColor)}
      onClick={props.handleClick}
    >
      <FontAwesomeIcon
        className="button-icon"
        icon={props.icon}
        spin={props.spin}
      />
      {props.caption}
    </button>
  );
}
