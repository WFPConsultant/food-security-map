import React from "react";

const Legend = ({ active, legendData }) => {
  const renderLegendKeys = (threshold, i) => {
    return (
      <div key={i} className="txt-s">
        <span
          className="mr6 round-full w12 h12 inline-block align-middle"
          style={{ backgroundColor: threshold.color }}
        />
        <span>{`${threshold.prevalence}`}</span> 
      </div>
    );
  };

  return (
    <div className="bg-white absolute bottom right mr12 mb24 py12 px12 shadow-darken10 round z1 wmax180">
      <div className="mb6">
        <h2 className="txt-bold txt-s block">{active.name}</h2>
        <p className="txt-s color-gray">{active.description}</p>
      </div>
      {legendData.map(renderLegendKeys)} 
    </div>
  );
};

export default Legend;
