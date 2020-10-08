import React from "react";
import "./Home.css";
import SetupLogo from "../SetupLogo/SetupLogo";
import Button from "../../components/Button/Button";
import { faCode, faRocket } from "@fortawesome/free-solid-svg-icons";
import { useHistory } from 'react-router-dom';

export default function Home() {
  const history = useHistory();

  const handleDevelopmentClick = () => {
    history.push("/setup");
  }

  const handleCompetitionClick = () => {
    history.push("/main");
  }

  return (
    <div className="home-wrapper centered">
      <SetupLogo></SetupLogo>
      <div className="home-wrapper-content">
        What are you up to today?
      </div>
      <Button
        caption="DEVELOPMENT"
        handleClick={handleDevelopmentClick}
        backgroundColor="bg-white-gradient"
        icon={faCode}
      ></Button>
      <Button
        caption="COMPETITION"
        handleClick={handleCompetitionClick}
        backgroundColor="bg-white-gradient"
        icon={faRocket}
      ></Button>
    </div>
  );
}
