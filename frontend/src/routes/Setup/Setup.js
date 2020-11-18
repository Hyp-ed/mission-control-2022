import React, { useState, useEffect } from "react";
import "./Setup.css";
import SetupLogo from "../SetupLogo/SetupLogo";
import Button from "../../components/Button/Button";
import { useHistory } from "react-router-dom";
import {
  faPlay,
  faCogs,
  faWifi,
  faSpinner,
  faCheck,
  faRedo
} from "@fortawesome/free-solid-svg-icons";
import path from "path"

export default function Setup(props) {
  const history = useHistory();
  const [flags, setFlags] = useState([]);

  const fakeSystems = [
    { name: "IMU", value: "--fake_imu", defaultChecked: true },
    { name: "IMU FAIL", value: "--fake_imu_fail", defaultChecked: false },
    { name: "Batteries", value: "--fake_batteries", defaultChecked: true },
    { name: "Batteries FAIL", value: "--fake_batteries_fail", defaultChecked: false },
    { name: "Keyence", value: "--fake_keyence", defaultChecked: true },
    { name: "Keyence FAIL", value: "--fake_keyence_fail", defaultChecked: false },
    { name: "Temperature", value: "--fake_temperature", defaultChecked: true },
    { name: "Temperature FAIL", value: "--fake_temperature_fail", defaultChecked: false },
    { name: "Embrakes", value: "--fake_embrakes", defaultChecked: true },
    { name: "Motors", value: "--fake_motors", defaultChecked: true },
    { name: "Battery test", value: "--battery_test", defaultChecked: false },
    { name: "High power", value: "--fake_highpower", defaultChecked: true }
  ];

  const additional = [];
  const getChoiceList = choices => {
    return choices.map(choice => (
      <div className="input-group-switch">
        <input
          type="checkbox"
          class="switch"
          value={choice.value}
          onChange={handleFlagChange}
          defaultChecked={choice.defaultChecked}
        ></input>
        <label>{choice.name}</label>
      </div>
    ));
  };

  const handleRunClick = () => {
    const data = flags;
    console.log(data)
    props.stompClient.send("/app/send/debug/compileRun", {}, JSON.stringify(data));
    history.push("/main");
  };

  const initiateFlags = () => {
    var newFlags = flags;

    newFlags.push("--fake_imu");
    newFlags.push("--fake_batteries");
    newFlags.push("--fake_keyence");
    newFlags.push("--fake_temperature");
    newFlags.push("--fake_embrakes");
    newFlags.push("--fake_motors");
    newFlags.push("--fake_highpower");
      };

  const handleFlagChange = e => {
    var newFlags = flags;
    if (e.target.checked) {
      newFlags.push(e.target.value);
    } else {
      newFlags.splice(newFlags.indexOf(e.target.value), 1);
    }
    setFlags(newFlags);
  };

  // document.onkeypress = function (e) {
  //   if (e.code == "Enter") {
  //     handleConnectClick();
  //   }
  // };

  useEffect(() => {
    initiateFlags();
  }, []); // Only run once

  // TODO: fittext
  return (
    <div className="setup-wrapper centered">
      <SetupLogo></SetupLogo>
      <div className="input-group">
        <label>Fake systems</label>
        <div className="input-group-multiple">{getChoiceList(fakeSystems)}</div>
      </div>
      {/* <div className="input-group">
        <label>Additional values</label>
        <div className="input-group-multiple">{getChoiceList(additional)}</div>
      </div> */}
      <div className="setup-wrapper-buttons">
        <Button
          caption="RUN"
          handleClick={handleRunClick}
          backgroundColor="bg-white-gradient"
          icon={faPlay}
        ></Button>
        {/* <Button
          caption="COMPILE & RUN"
          handleClick={handleCompileClick}
          backgroundColor="bg-red-gradient"
          icon={faCogs}
          disabled={true}
        ></Button> */}
      </div>
    </div>
  );
}
