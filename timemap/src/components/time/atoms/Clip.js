import React from "react";

const TimelineClip = ({ dims }) => (
  <clipPath id="clip">
    <rect
      x={0}
      y="0"
      width={dims.width}
      height={dims.contentHeight}
    />
  </clipPath>
);

export default TimelineClip;
