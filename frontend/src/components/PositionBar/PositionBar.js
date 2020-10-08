import React from 'react'
import "./PositionBar.css"

export default function PositionBar(props) {
    
    //TODO: implement distance formatter to keep zero padding

    return (
        <div className="position-bar-root">
            <div className="position-bar-background"></div>
            <div className="position-value">{props.distance}m</div>
        </div>
    )
}

PositionBar.defaultProps = {
    distance: "0000",
}