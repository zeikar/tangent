import { useLayoutEffect } from "react";
import { continueRender, delayRender, useCurrentFrame } from "remotion";
import { PROBE_PREFIX } from "./prefix";
import { snapshot } from "./snapshot";

declare global {
  interface Window {
    remotion_delayRenderHandles: number[];
  }
}

// Mounted last in a composition rendered with the `probe` prop: once the
// frame is fully laid out (every other delayRender cleared, and two snapshots
// a tick apart agree, so no measured re-render is still pending), logs what
// the frame draws for scripts/probe.mts. `extra` rides along on frame 0.
export const Probe: React.FC<{ extra?: unknown }> = ({ extra }) => {
  const frame = useCurrentFrame();
  useLayoutEffect(() => {
    const handle = delayRender(`probe frame ${frame}`);
    let done = false;
    let last = "";
    const tick = () => {
      if (done) return;
      if (window.remotion_delayRenderHandles.some((h) => h !== handle)) {
        setTimeout(tick, 4);
        return;
      }
      const now = JSON.stringify(snapshot());
      if (now !== last) {
        last = now;
        setTimeout(tick, 4);
        return;
      }
      done = true;
      console.log(`${PROBE_PREFIX}{"frame":${frame},"els":${now}${frame === 0 && extra ? `,"extra":${JSON.stringify(extra)}` : ""}}`);
      continueRender(handle);
    };
    document.fonts.ready.then(tick);
    return () => {
      if (!done) {
        done = true;
        continueRender(handle);
      }
    };
  }, [frame, extra]);
  return null;
};
