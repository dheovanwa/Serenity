import React from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from "recharts";

const CustomRadarChart = ({
  data,
  dataKey,
  labelKey,
  strokeColor = "black",
  fillColor = "white",
  gridLineColor = "black", 
  tickColor = "black", 
  width,
  height,
}) => {
  return (
    <RadarChart data={data} width={width} height={height}>
      
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
        dot={{ r: 6, fill: "white", stroke: "black", strokeWidth: 2, fillOpacity: 1 }}
      />
      <Tooltip />
    </RadarChart>
  );
};

export default CustomRadarChart;
