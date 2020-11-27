import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [scrollCnt, setScrollCnt] = useState(0)

  const updateIsLive = (value) => {
    if (value == isLive) {
      return;
    }
    setIsLive(!isLive);
    props.stompClient.send("/app/send/debug/isLive", {}, {});
  }

  const topObserver = useRef()
  const firstLineRef = useCallback(node => {
    if (loading) {
      return
    }
    if (topObserver.current) {
      topObserver.current.disconnect()
    }
    topObserver.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && props.curStart != 0 && !isLive) {
        setLoading(true);
        setScrollCnt(Math.min(100, props.curStart - 0));
        props.stompClient.send("/app/send/debug/moreLines", {}, {});
      }
    })
    if (node) {
      topObserver.current.observe(node)
    }
  }, [loading, props.curStart, isLive])
  
  const botObserver = useRef()
  const lastLineRef = useCallback(node => {
    if (loading) {
      return
    }
    if (botObserver.current) {
      botObserver.current.disconnect()
    }
    botObserver.current = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) {
        console.log("not visible");
        updateIsLive(false);
      } else {
        console.log("visible")
        updateIsLive(true);
      }
    })
    if (node) {
      botObserver.current.observe(node)
    }
  }, [loading, isLive])

  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }

  useEffect(() => {
    if (loading) {
      var position = scrollableNodeRef.current.scrollHeight / props.terminalOutput.length * scrollCnt
      scrollableNodeRef.current.scrollTo(0, position);
      setLoading(false);
    }
  }, [props.curStart]);

  // updates terminal output in the pre
  useEffect(() => {
    if (isLive && JSON.stringify(previousOutput) != JSON.stringify(props.terminalOutput) && scrollableNodeRef.current !== null) {
      scrollableNodeRef.current.scrollTo(0, scrollableNodeRef.current.scrollHeight);
    }
    return function cleanup() {
      // TODO: we can cleanup the terminal here when the terminal is inactive
      //  or when too much is in the pre
      if (props.isInactive) console.log("terminal off", true);
    };
  }, [props.terminalOutput]); //useEffect only called when terminal output changes

  if (props.isInactive) {
    return null;
  }

  let terminalOut = 
    props.terminalOutput && 
    props.terminalOutput.length > 0 && 
    props.terminalOutput.map((log, index) => {
      if (index == 0) {
        return <div ref={firstLineRef} key={index}>{log.line}</div>
      } else if (index == props.terminalOutput.length - 1) {
        return <div ref={lastLineRef} key={index}>{log.line}</div>
      } else {
        return <div key={index}>{log.line}</div>
      }
    })
  
  const handleKillClick = () => {
    props.stompClient.send("/app/send/debug/kill", {}, {});
  }

  const scrollToEnd = () => {
    if (scrollableNodeRef.current != null) {
      scrollableNodeRef.current.scrollTo(0, scrollableNodeRef.current.scrollHeight);
    }
  }

  const handleSearch = (event) => {
    var myObj = {"searchPhrase": event.target.value};
    props.stompClient.send("/app/send/debug/search", {}, JSON.stringify(myObj));
    scrollToEnd();
  }

  const filterLogType = (event) => {
    var myObj = {"logType": event.target.value};
    props.stompClient.send("/app/send/debug/logType", {}, JSON.stringify(myObj));
    scrollToEnd();
  }

  const filterSubmodule = (event) => {
    var myObj = {"submodule": event.target.value};
    props.stompClient.send("/app/send/debug/submodule", {}, JSON.stringify(myObj));
    scrollToEnd();
  }

  let logTypeOptions = 
    props.logTypes &&
    props.logTypes.length > 0 &&
    props.logTypes.map((logType, index) => {
      return <option>{logType}</option>
    })

  let submoduleOptions = 
    props.submoduleTypes &&
    props.submoduleTypes.length > 0 &&
    props.submoduleTypes.map((submoduleType, index) => {
      return <option>{submoduleType}</option>
    })

  return (
    <div className="terminal-root">
      <div>{loading && "loading..."}</div> 
      <SimpleBar className="terminal-content" forceVisible="y" autoHide={false} scrollableNodeProps={{ ref: scrollableNodeRef }}>
        <pre id="terminal_pre">{terminalOut}</pre>
      </SimpleBar>
      <div className="footer">
        <select 
          name="log-type-dropdown"
          onChange={filterLogType}
        >
          {logTypeOptions}
        </select>
        <select 
          name="submodule-dropdown" 
          onChange={filterSubmodule}
        >
          {submoduleOptions}
        </select>
        <input 
          type="text"
          placeholder="Search..." 
          name="search"
          onChange={handleSearch}
        ></input>
        <Button
          caption="To End"
          backgroundColor="#FFFFFF"
          textColor="#000000"
          width="38%"
          handleClick={scrollToEnd}
        ></Button>
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
