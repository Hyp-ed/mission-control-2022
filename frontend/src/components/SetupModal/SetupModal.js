import React, { useState } from "react";
import Modal from "react-modal";
import "./SetupModal.css";
import Button from "../Button/Button";
import { faPlay } from "@fortawesome/free-solid-svg-icons";

export default function SetupModal(props) {
  const [systemConfig, setSystemConfig] = useState([
    "use_fake_trajectory",
    "use_fake_batteries",
    "use_fake_temperature",
    "use_fake_brakes",
    "use_fake_controller",
    "use_fake_high_power",
  ]);
  Modal.setAppElement("#root");

  const fakeSystems = [
    { name: "Trajectory", value: "use_fake_trajectory", defaultChecked: true },
    { name: "Batteries", value: "use_fake_batteries", defaultChecked: true },
    { name: "Batteries FAIL", value: "use_fake_batteries_fail", defaultChecked: false },
    { name: "Temperature", value: "use_fake_temperature", defaultChecked: true },
    { name: "Temperature FAIL", value: "use_fake_temperature_fail", defaultChecked: false },
    { name: "Brakes", value: "use_fake_brakes", defaultChecked: true },
    { name: "Motor Controllers", value: "use_fake_controller", defaultChecked: true },
    { name: "High Power", value: "use_fake_high_power", defaultChecked: true },
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
        ></input>
        <label>{choice.name}</label>
      </div>
    ));
  };

  const handleRunClick = () => {
    const data = systemConfig;
    props.setModalOpen(false);
    props.stompClient.send("/app/send/debug/run", {}, JSON.stringify(data));
  };

  const handleFlagChange = (e) => {
    var newFlags = systemConfig;
    if (e.target.checked) {
      newFlags.push(e.target.value);
    } else {
      newFlags.splice(newFlags.indexOf(e.target.value), 1);
    }
    setSystemConfig(newFlags);
  };

  const closeModal = () => {
    props.setModalOpen(false);
  };

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
          <Button caption="RUN" handleClick={handleRunClick} backgroundColor="button-blue" icon={faPlay}></Button>
        </div>
      </div>
    </Modal>
  );
}
