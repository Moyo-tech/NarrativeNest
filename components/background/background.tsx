import "./background.css";

import React from "react";

const Background = () => {
  return (
    <div>
      {/* add a noise background */}
      <div className="bg-noise"></div>
      {/* add a gradient background */}
      <div className="bg-gradient"></div>
    </div>
  );
};

export default Background;
