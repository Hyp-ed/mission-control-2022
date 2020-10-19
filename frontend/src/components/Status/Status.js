import React from 'react';
import "./Status.css";
import Indicator from '../Indicator/Indicator';

export default function Status(props) {    
    if (props.isInactive) {
        return(null);
    }

    return (
        <div className="status-root">
            <div className="brake-status-container-wrapper">
                <div className="brake-status-container">
                    <div className="brake-status">
                        <Indicator caption="EM BRAKE 1" enabled={props.statusData[0].value[0].value} brake/>
                    </div>
                    <div className="brake-status">
                        <Indicator caption="FRICTION BRAKE 1" enabled={props.statusData[1].value[0].value} brake/>
                    </div>
                    <div className="brake-status">
                        <Indicator caption="EM BRAKE 2" enabled={props.statusData[0].value[1].value} brake/>
                    </div>
                    <div className="brake-status">
                        <Indicator caption="FRICTION BRAKE 2" enabled={props.statusData[1].value[1].value} brake/>
                    </div>
                </div>
            </div>
            <div className="imu-status">
                <div className="title">IMUS</div>
                <div className="indicator-box">
                    <Indicator enabled={props.statusData[2].value[0].value}/>
                    <Indicator enabled={props.statusData[2].value[1].value}/>
                    <Indicator enabled={props.statusData[2].value[2].value}/>
                    <Indicator enabled={props.statusData[2].value[3].value}/>
                </div>
            </div>
            <div className="module-status">
                <div className="title">MODULES</div>
                <div className="indicator-box">
                    <Indicator caption="MOT" status={props.statusData[4].value[0].value}/>
                    <Indicator caption="BAT" status={props.statusData[4].value[3].value}/>
                    <Indicator caption="SEN" status={props.statusData[4].value[1].value}/>
                    <Indicator caption="TEL" status={props.statusData[4].value[4].value}/>
                    <Indicator caption="NAV" status={props.statusData[4].value[2].value}/>
                    <Indicator caption="BRA" status={props.statusData[4].value[5].value}/>
                </div>
            </div>
            <div className="encoder-status">
                <div className="encoder-title">WHEEL ENCODERS</div>
                <div className="indicator-box">
                    <Indicator enabled={props.statusData[3].value[0].value}/>
                    <Indicator enabled={props.statusData[3].value[1].value}/>
                    <Indicator enabled={props.statusData[3].value[2].value}/>
                    <Indicator enabled={props.statusData[3].value[3].value}/>
                </div>
            </div>
        </div>
    );
}
