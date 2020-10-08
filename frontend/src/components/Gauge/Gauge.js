import React from "react";
import LiquidFillGauge from "react-liquid-gauge";

const black = "#000000";
const gray = "#8F8F8F";
const green = "#00A000";
const yellow = "#EAA200";
const red = "#F10026";

const gradientStops = [
  {
    key: "0%",
    stopColor: green,
    stopOpacity: 1,
    offset: "0%"
  },
  {
    key: "60%",
    stopColor: yellow,
    stopOpacity: 0.75,
    offset: "75%"
  },
  {
    key: "80%",
    stopColor: red,
    stopOpacity: 0.5,
    offset: "100%"
  }
];

export default function Gauge(props) {
  const maxValue = props.value.max;
  const pctValue = (props.value.value / maxValue) * 100;

  // Specifies a custom text renderer for rendering a percent value.
  const textRenderer = () => {
    const value = Math.round(props.value.value);
    const fontSize = props.size / 4;
    return (
      <tspan>
        <tspan className="value" style={{ fontSize }}>
          {value}
        </tspan>
        <tspan style={{ fontSize: fontSize * 0.6 }}>{props.value.unit}</tspan>
      </tspan>
    );
  };

  return (
    <LiquidFillGauge
      innerRadius={0.9}
      width={props.size}
      height={props.size}
      value={pctValue} // value must be in percent as per documentation
      textRenderer={textRenderer}
      riseAnimation
      waveAnimation={false}
      waveFrequency={2}
      waveAmplitude={0} // remove wave
      gradient
      gradientStops={gradientStops}
      circleStyle={{ fill: pctValue > 80 ? red : gray }}
      textStyle={{
        fill: gray
      }}
      waveTextStyle={{
        fill: black
      }}
    />
  );
}
