import React from "react";
import { ElementTimeline, lerp, phase, Scene } from "../storyboard/timeline";
import { content, zone } from "../style/theme";
import { lerpPt, Pt } from "./geometry";

// The camera: how the picture is framed. It draws nothing; with one in the
// storyboard, StoryboardPlayer shows every other element through it, clipped
// just inside the visual zone (cameraInset; captions and the channel mark
// stay put). moveTo {center, zoom} puts the picture's point `center` at the
// visual zone's center, scaled by zoom; at rest the picture is as drawn.
// Spec: storyboard.json → components → Camera.

// A picture point p shows at shift + zoom × p.
export type CameraState = { shift: Pt; zoom: number };

export const HOME: Pt = [content.centerX, (zone.visual.top + zone.visual.bottom) / 2];

const shiftFor = ([cx, cy]: Pt, zoom: number): Pt => [HOME[0] - zoom * cx, HOME[1] - zoom * cy];

export const cameraState = (el: ElementTimeline, scene: Scene): CameraState => {
  let shift: Pt = [0, 0];
  let zoom = 1;
  for (const a of el.actions) {
    if (scene.frame < a.from) break;
    if (a.action !== "moveTo") throw new Error(`Camera ${el.spec.id}: unknown action ${a.action}`);
    const e = phase(a, scene.frame);
    // Shift and zoom each move linearly, so every picture point travels on a
    // straight line (easing a center and a zoom separately bends the paths).
    shift = lerpPt(shift, shiftFor(a.params.center, a.params.zoom), e);
    zoom = lerp(zoom, a.params.zoom, e);
  }
  return { shift, zoom };
};

export const onScreen = ({ shift, zoom }: CameraState, [x, y]: Pt): Pt => [shift[0] + zoom * x, shift[1] + zoom * y];

// The CSS transform that shows the picture through the camera.
export const cameraTransform = ({ shift, zoom }: CameraState) => `translate(${shift[0]}px, ${shift[1]}px) scale(${zoom})`;

export const Camera: React.FC<{ el: ElementTimeline; scene: Scene }> = () => null;
