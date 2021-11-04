/* eslint-disable react/no-array-index-key */
import "./Terminal.css";
import "simplebar/dist/simplebar.min.css";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { faArrowDown, faCaretDown, faCaretUp, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import SimpleBar from "simplebar-react";

import Button from "../Button/Button";

function DropdownItem({clickEffect, children}) {
  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <a href="#" className="menu-item" onClick={clickEffect}>
      {children}
    </a>
  );
}

export default function Terminal({terminalOutput,curStart,stompClient,isInactive,logTypes,submoduleTypes}) {
  const scrollableNodeRef = React.createRef();
  const previousOutput = usePrevious(terminalOutput);
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [scrollCnt, setScrollCnt] = useState(0);
  const [open, setOpen] = useState("");

  const topObserver = useRef();
  const firstLineRef = useCallback(
    (node) => {
      if (loading) {
        return;
      }
      if (topObserver.current) {
        topObserver.current.disconnect();
      }
      topObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && curStart !== 0 && !isLive) {
          setLoading(true);
          setScrollCnt(Math.min(100, curStart - 0));
          stompClient.send("/app/send/debug/moreLines", {}, {});
        }
      });
      if (node) {
        topObserver.current.observe(node);
      }
    },
    [loading, curStart, isLive, stompClient],
  );

  const botObserver = useRef();
  const lastLineRef = useCallback(
    (node) => {
      const updateIsLive = (value) => {
        if (value === isLive) {
          return;
        }
        setIsLive(!isLive);
        stompClient.send("/app/send/debug/isLive", {}, {});
      };
      if (loading) {
        return;
      }
      if (botObserver.current) {
        botObserver.current.disconnect();
      }
      botObserver.current = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) {
          updateIsLive(false);
        } else {
          updateIsLive(true);
        }
      });
      if (node) {
        botObserver.current.observe(node);
      }
    },
    [loading, isLive, stompClient],
  );

  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }

  useEffect(() => {
    if (loading) {
      const position = (scrollableNodeRef.current.scrollHeight / terminalOutput.length) * scrollCnt;
      scrollableNodeRef.current.scrollTo(0, position);
      setLoading(false);
    }
  }, [loading, scrollableNodeRef, terminalOutput.length, scrollCnt]);

  // updates terminal output in the pre
  useEffect(() => {
    if (
      isLive &&
      JSON.stringify(previousOutput) !== JSON.stringify(terminalOutput) &&
      scrollableNodeRef.current !== null
    ) {
      scrollableNodeRef.current.scrollTo(0, scrollableNodeRef.current.scrollHeight);
    }
    return function cleanup() {
      // TODO: we can cleanup the terminal here when the terminal is inactive
      //  or when too much is in the pre
      if (isInactive) console.log("terminal off");
    };
  }, [terminalOutput, isLive, previousOutput, isInactive, scrollableNodeRef]); // useEffect only called when terminal output changes

  if (isInactive) {
    return null;
  }

  const terminalOut =
    terminalOutput &&
    terminalOutput.length > 0 &&
    terminalOutput.map((log, index) => {
      if (index === 0) {
        return (
          <div ref={firstLineRef} key={index}>
            {log.line}
          </div>
        );
      }
      if (index === terminalOutput.length - 1) {
        return (
          <div ref={lastLineRef} key={index}>
            {log.line}
          </div>
        );
      }
      return <div key={index}>{log.line}</div>;
    });

  const handleKillClick = () => {
    stompClient.send("/app/send/debug/kill", {}, {});
  };

  const scrollToEnd = () => {
    if (scrollableNodeRef.current != null) {
      scrollableNodeRef.current.scrollTo(0, scrollableNodeRef.current.scrollHeight);
    }
  };

  const handleSearch = (event) => {
    const myObj = { searchPhrase: event.target.value };
    stompClient.send("/app/send/debug/search", {}, JSON.stringify(myObj));
    scrollToEnd();
  };

  const filterLogType = (value) => {
    const myObj = { logType: value };
    stompClient.send("/app/send/debug/logType", {}, JSON.stringify(myObj));
    scrollToEnd();
    setOpen("");
  };

  const filterSubmodule = (value) => {
    const myObj = { submodule: value };
    stompClient.send("/app/send/debug/submodule", {}, JSON.stringify(myObj));
    scrollToEnd();
    setOpen("");
  };

  const logTypeOptions =
    logTypes &&
    logTypes.length > 0 &&
    logTypes.map((logType) => {
      return <DropdownItem clickEffect={() => filterLogType(logType)}>{logType}</DropdownItem>;
    });

  const submoduleOptions =
    submoduleTypes &&
    submoduleTypes.length > 0 &&
    submoduleTypes.map((submoduleType) => {
      return <DropdownItem clickEffect={() => filterSubmodule(submoduleType)}>{submoduleType}</DropdownItem>;
    });

  if (terminalOutput !== "") {
    return (
      <div id="terminal-container" className="container">
        <SimpleBar
          className="terminal-content"
          forceVisible="y"
          autoHide={false}
          scrollableNodeProps={{ ref: scrollableNodeRef }}
        >
          <pre id="terminal_pre">{terminalOut}</pre>
        </SimpleBar>
        <div className="footer filtering">
          <Button caption="Kill Process" icon={faTimesCircle} handleClick={handleKillClick} />
          <div className="dropdown-group">
            <Button
              caption="Log Type"
              icon={open === "log" ? faCaretUp : faCaretDown}
              handleClick={() => {
                if (open === "log") {
                  setOpen("");
                } else {
                  setOpen("log");
                }
              }}
            />
            {open === "log" && <div className="dropdown">{logTypeOptions}</div>}
          </div>
          <div className="dropdown-group">
            <Button
              caption="Submodule"
              icon={open === "sub" ? faCaretUp : faCaretDown}
              handleClick={() => {
                if (open === "sub") {
                  setOpen("");
                } else {
                  setOpen("sub");
                }
              }}
            />
            {open === "sub" && <div className="dropdown">{submoduleOptions}</div>}
          </div>
        </div>
        <div className="footer other">
          <input type="text" placeholder="Search..." name="search" onChange={handleSearch} />
        </div>
        {!isLive && (
          <div className="toEndWrapper">
            <Button caption="" icon={faArrowDown} width="38%" handleClick={scrollToEnd} />
          </div>
        )}
      </div>
    );
  }

  return <div id="terminal-container" className="container" />;
}

Terminal.defaultProps = {
  content: "The content prop of this component has not been set",
  flags: [],
  debug_level: "0",
};
