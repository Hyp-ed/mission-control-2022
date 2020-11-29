import React, { useState, useEffect } from "react";
import Modal from 'react-modal';
import "./DebugModal.css";
import Button from "../Button/Button";
import {
  faRedo,
} from "@fortawesome/free-solid-svg-icons";

export default React.memo(props => {
  Modal.setAppElement('#root');

  const handleCompileClick = () => {
    props.setDebugModalOpen(false);
    props.stompClient.send("/app/send/debug/setCompile", {}, "COMPILE");
    props.stompClient.send("/app/send/debug/compileRun", {}, "COMPILE");
  };


  useEffect(() => {
    //Get the error message
  }, []); // Only run once
  
  const closeModal = () => {
    props.setDebugModalOpen(false);
  }
  
  const getErrorMessage = () => {
    return props.debugErrorMessage.split("\n").map(msg => {
      if (msg.length > 0) {
        return(
          <div>{msg}</div>
        )
      }
    })
  }

  // TODO: fittext
  return (
    <Modal
      isOpen={props.isDebugModalOpen}
      onRequestClose={closeModal}
      className="modal-run"
      overlayClassName="modal-run-overlay"
    >
      <div className="setup-wrapper centered container">
        <div className="input-group">
          <label>Compilation failed</label>
          {getErrorMessage()}
        </div>
        <div className="setup-wrapper-buttons">
          <Button
            caption="RETRY"
            handleClick={handleCompileClick}
            backgroundColor="button-red"
            icon={faRedo}
          ></Button>
        </div>
      </div>
    </Modal>
  );
})
