import React from "react";
import { color } from "../style/theme";

type Props = {
  width: number;
  height: number;
  step: number;
  // A point the lines pass through, so the grid lines up with drawn axes.
  originX: number;
  originY: number;
};

// Coordinate-plane backdrop: faint lines every `step` px.
export const Grid: React.FC<Props> = ({
  width,
  height,
  step,
  originX,
  originY,
}) => {
  const lines = (origin: number, extent: number) => {
    const out: number[] = [];
    for (let p = ((origin % step) + step) % step; p <= extent; p += step) {
      out.push(p);
    }
    return out;
  };
  return (
    <svg
      width={width}
      height={height}
      style={{ position: "absolute", left: 0, top: 0 }}
    >
      {lines(originX, width).map((x) => (
        <line
          key={`x${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          stroke={color.grid}
          strokeWidth={3}
        />
      ))}
      {lines(originY, height).map((y) => (
        <line
          key={`y${y}`}
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke={color.grid}
          strokeWidth={3}
        />
      ))}
    </svg>
  );
};
