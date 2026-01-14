import React, { CSSProperties } from "react";

const Background = () => {
  const noiseStyle: CSSProperties = {
    position: "fixed",
    height: "100vh",
    width: "100vw",
    opacity: 0.05,
    backgroundRepeat: "repeat, no-repeat",
    zIndex: -1,
    backgroundImage: "url('https://uploads-ssl.webflow.com/62c435401c8f7261df7dac30/62c5acd6c07e3c25ed49ea71_624d5860b71355f93453ff75_grain.gif')",
  };

  const gradientStyle: CSSProperties = {
    position: "fixed",
    zIndex: -2,
    height: "100vh",
    width: "100vw",
    opacity: 1,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "0 0",
    backgroundImage: "url('https://uploads-ssl.webflow.com/62c435401c8f7261df7dac30/62c44e50efe5bfb56fdc13a4_Andy-hooke-bg%20(1).jpg')",
  };

  return (
    <div>
      {/* add a noise background */}
      <div style={noiseStyle}></div>
      {/* add a gradient background */}
      <div style={gradientStyle}></div>
    </div>
  );
};

export default Background;
