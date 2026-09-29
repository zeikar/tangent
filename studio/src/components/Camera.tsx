import React from "react";
import { ElementTimeline, lerp, phase, Scene } from "../storyboard/timeline";
import { content, zone } from "../style/theme";
import { lerpPt, Pt } from "./geometry";

// The camera: how the picture is framed. It draws nothing; with one in the
// storyboard, StoryboardPlayer shows every other element through it, clipped
// just inside the visual zone (cameraInset; captions and the channel mark
// stay put). moveTo
// {center, zoom} puts the picture's point `center` at the visual zone's
// center, scaled by zoom; at rest the picture is as drawn.
// Spec: storyboard.json → components → Camera.

export type CameraState = { center: Pt; zoom: number };

export const HOME: Pt = [content.centerX, (zone.visual.top + zone.visual.bottom) / 2];

export const cameraState = (el: ElementTimeline, scene: Scene): CameraState => {
  let center = HOME;
  let zoom = 1;
  for (const a of el.actions) {
    if (scene.frame < a.from) break;
    if (a.action !== "moveTo") throw new Error(`Camera ${el.spec.id}: unknown action ${a.action}`);
    const e = phase(a, scene.frame);
    center = lerpPt(center, a.params.center, e);
    zoom = lerp(zoom, a.params.zoom, e);
  }
  return { center, zoom };
};

// The CSS transform that shows the picture through the camera.
export const cameraTransform = ({ center, zoom }: CameraState) =>
  `translate(${HOME[0] - zoom * center[0]}px, ${HOME[1] - zoom * center[1]}px) scale(${zoom})`;

export const Camera: React.FC<{ el: ElementTimeline; scene: Scene }> = () => null;
