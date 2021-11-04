import "./DebugModal.css";
import "simplebar/dist/simplebar.min.css";

import React, { useEffect } from "react";

import { faRedo } from "@fortawesome/free-solid-svg-icons";
import Modal from "react-modal";
import SimpleBar from "simplebar-react";

import Button from "../Button/Button";

export default React.memo((props) => {
  Modal.setAppElement("#root");

  const handleCompileClick = () => {
    props.setDebugModalOpen(false);
    props.stompClient.send("/app/send/debug/compile", {}, "COMPILE");
    props.setDebugStatus("COMPILING");
  };

  useEffect(() => {
    if (props.debugStatus === "RETRY") {
      props.setDebugModalOpen(true);
    }
  }, [props.debugStatus]);

  const closeModal = () => {
    props.setDebugModalOpen(false);
  };

  const getErrorMessage = () => {
    return props.debugErrorMessage.split("\n").map((msg) => {
      if (msg.length > 0) {
        return <pre className="errormsg">{msg}</pre>;
      }
      return null;
    });
  };

  // TODO: fittext
  return (
    <Modal
      isOpen={props.isDebugModalOpen}
      onRequestClose={closeModal}
      className="modal-run"
      overlayClassName="modal-run-overlay"
    >
      <div className="modal-dialog">
        <SimpleBar className="debug-wrapper centered container" forceVisible="y" autoHide={false}>
          <div className="debug-group">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label>Compilation failed</label>
            <div className="errormsgs">{getErrorMessage()}</div>
          </div>
          <div className="debug-wrapper-buttons">
            <Button caption="RETRY" handleClick={handleCompileClick} backgroundColor="button-red" icon={faRedo} />
          </div>
        </SimpleBar>
      </div>
    </Modal>
  );
});
