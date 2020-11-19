import React, { useState, useEffect } from "react";
import Modal from 'react-modal';
import "./SetupModal.css";
import Button from "../Button/Button";
import {
  faPlay,
} from "@fortawesome/free-solid-svg-icons";

export default props => {
  const [flags, setFlags] = useState([]);
  Modal.setAppElement('#root');

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
    props.setModalOpen(false);
    props.stompClient.send("/app/send/debug/run", {}, JSON.stringify(data));
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

  useEffect(() => {
    initiateFlags();
  }, []); // Only run once

  const closeModal = () => {
    props.setModalOpen(false);
  }

  // TODO: fittext
  return (
    <Modal
      isOpen={props.isModalOpen}
      onRequestClose={closeModal}
      className="modal-run"
      overlayClassName="modal-run-overlay"
    >
      <div className="setup-wrapper centered container">
        <div className="input-group">
          <label>Fake systems</label>
          <div className="input-group-multiple">{getChoiceList(fakeSystems)}</div>
        </div>
        <div className="setup-wrapper-buttons">
          <Button
            caption="RUN"
            handleClick={handleRunClick}
            backgroundColor="button-blue"
            icon={faPlay}
          ></Button>
        </div>
      </div>
    </Modal>
  );
}
