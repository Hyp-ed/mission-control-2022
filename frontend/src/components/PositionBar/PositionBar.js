import React from 'react'
import "./PositionBar.css"

export default function PositionBar(props) {
    
    //TODO: implement distance formatter to keep zero padding
    return (
        <div className="position-bar-root">
            <div className="position-bar-background">
                <div className="cursor" style={{marginLeft: (props.telemetryData.crucial_data[0].value * 88) / (props.telemetryData.crucial_data[0].max) + '%'}}></div>
            </div>
            
            <div className="position-value">{(props.telemetryData.crucial_data[0].value).toFixed(0)}{props.telemetryData.crucial_data[0].unit}</div>
        </div>
    )
}

PositionBar.defaultProps = {
    distance: "0000",
}