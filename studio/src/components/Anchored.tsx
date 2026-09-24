import React from "react";

type Anchor = "center" | "top" | "bottom" | "left";

const shift: Record<Anchor, string> = {
  center: "-50% -50%",
  top: "-50% 0", // (x, y) is the top-center of the content
  bottom: "-50% -100%", // (x, y) is the bottom-center of the content
  left: "0 -50%", // (x, y) is the left-middle of the content
};

// Places content at a frame point by one of its edges, whatever its size, so
// labels need no measuring.
export const Anchored: React.FC<{
  x: number;
  y: number;
  anchor: Anchor;
  opacity?: number;
  scale?: number;
  children: React.ReactNode;
}> = ({ x, y, anchor, opacity = 1, scale = 1, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      translate: shift[anchor],
      scale: String(scale),
      opacity,
      display: "flex",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);
