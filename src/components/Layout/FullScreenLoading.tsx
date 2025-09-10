import LinearProgress from "@mui/material/LinearProgress";
import React from "react";
// import DefaultLogo from "waratah-logo.svg";
import DefaultLogo from "../Application/visionxlogo.jpg";

export default function FullScreenLoading() {
  return (
    <div className="fullScreen-loading-wrapper">
      <div>
        <div>
          <img src={DefaultLogo} />
        </div>
        <LinearProgress className="progressBar" />
      </div>
    </div>
  );
}
