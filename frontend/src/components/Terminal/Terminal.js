import React, { useState, useEffect, useRef } from "react";
import "./Terminal.css";
import { animateScroll } from "react-scroll";
import Button from "../Button/Button";
import { faSkull, faPlay } from "@fortawesome/free-solid-svg-icons";
import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";

export default function Terminal(props) {
  const flags = props.flags;
  const debug_level = props.debug_level;
  const scrollableNodeRef = React.createRef();
  const previousOutput = usePrevious(props.terminalOutput);

  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }

  //updates terminal output in the pre
  useEffect(() => {
    if (JSON.stringify(previousOutput) != JSON.stringify(props.terminalOutput) && scrollableNodeRef.current !== null) {
      scrollableNodeRef.current.scrollTo(0, scrollableNodeRef.current.scrollHeight);
    }
    return function cleanup() {
      // TODO: we can cleanup the terminal here when the terminal is inactive
      //  or when too much is in the pre
      if (props.isInactive) console.log("terminal off");
    };
  }, [props.terminalOutput]); //useEffect only called when terminal output changes


  if (props.isInactive) {
    return null;
  }

  const getTerminalOutput = () => {
    if (props.terminalOutput == null || !props.terminalOutput) {
        return;
    }
    return props.terminalOutput.map(log => (log.line + "\n"));
  };

  const handleKillClick = () => {
    props.stompClient.send("/app/send/debug/kill", {}, {});
  }

  const handleSearch = (event) => {
    var myObj = {"searchPhrase": event.target.value};
    props.stompClient.send("/app/send/debug/search", {}, JSON.stringify(myObj));
  }

  return (
    <div className="terminal-root">
      <SimpleBar className="terminal-content" forceVisible="y" autoHide={false} scrollableNodeProps={{ ref: scrollableNodeRef }}>
        <pre id="terminal_pre">{getTerminalOutput()}</pre>
      </SimpleBar>
      <div className="bottom-buttons">
        <input 
          type="text"
          placeholder="Search.." 
          name="search"
          onChange={handleSearch}
        ></input>
        <Button
          caption="KILL"
          backgroundColor="#FFFFFF"
          textColor="#000000"
          icon={faSkull}
          width="38%"
          handleClick={handleKillClick}
        ></Button>
      </div>
    </div>
  );
}

Terminal.defaultProps = {
  content: "The content prop of this component has not been set",
  flags: [],
  debug_level: "0"
};
