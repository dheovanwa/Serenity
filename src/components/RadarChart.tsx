import React from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CustomRadarChart = ({
  data,
  dataKey,
  labelKey,
  strokeColor = "black",
  fillColor = "white",
  gridLineColor = "black",
  tickColor = "black",
  width = "100%",  
  height = 750,    
  marginTop = 50,
}) => {
  return (
    <div style={{ width: "100%", height: height }}>
      <ResponsiveContainer width={width} height="100%">
        <RadarChart data={data}>
          <PolarGrid strokeWidth={2} stroke={gridLineColor} />
          <PolarAngleAxis
            dataKey={labelKey}
            tick={{ fill: tickColor, fontSize: 24, fontWeight: 'bold' }}
          />
          <Radar
            name={dataKey}
            dataKey={dataKey}
            stroke={strokeColor}
            fill={fillColor}
            fillOpacity={0.9}
            dot={{
              r: 6,
              fill: "white",
              stroke: "black",
              strokeWidth: 2,
              fillOpacity: 1,
            }}
          />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomRadarChart;