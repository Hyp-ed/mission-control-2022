import React from 'react'
import "./PositionBar.css"

export default function PositionBar(props) {

    console.log({props});

    //const min = props.telemetryData.crucial_data.find(o => o.name === "min").value;
    //const max = props.telemetryData.crucial_data.find(o => o.name === "max").value;
    //const unit = props.telemetryData.crucial_data.find(o => o.name === "unit").value;
    
    //TODO: implement distance formatter to keep zero padding
    return (
        <div className="position-bar-root">
            <div className="position-bar-background">
                <div className="cursor" style={{marginLeft: props.distance/4}}></div>
            </div>
            
            <div className="position-value">{props.distance}m</div>


        </div>
    )
}


PositionBar.defaultProps = {
    distance: "0000",
}