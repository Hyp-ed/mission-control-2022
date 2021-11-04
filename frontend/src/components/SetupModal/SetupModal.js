import "./SetupModal.css";

import React, { useState } from "react";

import { faPlay } from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal";

import Button from "../Button/Button";

export default function SetupModal({ isModalOpen, stompClient, setModalOpen }) {
  const [flags, setFlags] = useState([
    "--fake_imu",
    "--fake_batteries",
    "--fake_keyence",
    "--fake_temperature",
    "--fake_embrakes",
    "--fake_motors",
    "--fake_highpower",
  ]);
  Modal.setAppElement("#root");

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
    { name: "High power", value: "--fake_highpower", defaultChecked: true },
  ];

  const getChoiceList = (choices) => {
    return choices.map((choice) => (
      <div className="input-group-switch" key={choice.value}>
        <input
          type="checkbox"
          className="switch"
          value={choice.value}
          onChange={handleFlagChange}
          defaultChecked={choice.defaultChecked}
        />
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label>{choice.name}</label>
      </div>
    ));
  };

  const handleRunClick = () => {
    const data = flags;
    setModalOpen(false);
    stompClient.send("/app/send/debug/run", {}, JSON.stringify(data));
  };

  const handleFlagChange = (e) => {
    const newFlags = flags;
    if (e.target.checked) {
      newFlags.push(e.target.value);
    } else {
      newFlags.splice(newFlags.indexOf(e.target.value), 1);
    }
    setFlags(newFlags);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  // TODO: fittext
  return (
    <Modal isOpen={isModalOpen} onRequestClose={closeModal} className="modal-run" overlayClassName="modal-run-overlay">
      <div className="setup-wrapper centered container">
        <div className="input-group">
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label>Fake systems</label>
          <div className="input-group-multiple">{getChoiceList(fakeSystems)}</div>
        </div>
        <div className="setup-wrapper-buttons">
          <Button caption="RUN" handleClick={handleRunClick} backgroundColor="button-blue" icon={faPlay} />
        </div>
      </div>
    </Modal>
  );
}
