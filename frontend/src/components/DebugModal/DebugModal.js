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
          <pre className="errormsg">{msg}</pre>
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
      <div className="modal-dialog">
        <div className="debug-wrapper centered container">
          <div className="debug-group">
            <label>Compilation failed</label>
            <div className="errormsgs">{getErrorMessage()}</div>
          </div>
          <div className="debug-wrapper-buttons">
            <Button
              caption="RETRY"
              handleClick={handleCompileClick}
              backgroundColor="button-red"
              icon={faRedo}
            ></Button>
          </div>
        </div>
      </div>
    </Modal>
  );
})
