import React from "react";
import "./SetupLogo.css";
import logo from "../../hyped.png";

export default function SetupLogo() {
  return (
    <div className="setup-logo">
      <img src={logo} />
      <div className="title">Mission Control</div>
    </div>
  );
}
