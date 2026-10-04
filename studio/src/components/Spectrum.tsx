import React from "react";
import { AbsoluteFill } from "remotion";
import { ElementTimeline, Scene } from "../storyboard/timeline";
import { color, mark, optics } from "../style/theme";
import { bandState, gapU, nmColor, Part, Props, purpleAt, slices, swell, whiten } from "./band";
import { pointsAttr } from "./geometry";
import { InkLine, useInk } from "./InkText";
import { axisX } from "./light";
import { lifecycle, Svg } from "./shapes";

// The rainbow band: light spread out by wavelength, each wavelength's screen
// color (light.ts), long wavelengths on the left. Straight, it is one fill
// with a gradient stop every pixel. It can curl along its length into a ring
// whose gap the purples bridge (mixtures of its two end lights, which no
// single wavelength gives), and uncurl back. Curved, it is drawn in slices
// at most optics.slice px wide on the outside, so it still reads as a smooth
// gradient. Spec: storyboard.json → components → Spectrum.

export const Spectrum: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const p = el.spec.props as Props;
  const [long, short] = p.nm;
  const { appear, out } = lifecycle(el, scene.frame, () => {});
  const s = bandState(el, scene.frame);
  const names = p.names ?? [];
  const { ink, measuring } = useInk(`spectrum ${el.spec.id}`, appear * out > 0 && s.names > 0 ? names.map(([t]) => t) : []);
  if (appear * out <= 0) return null;
  if (measuring.length) return <AbsoluteFill>{measuring}</AbsoluteFill>;

  const nmAt = (u: number) => long - u * (long - short);
  const inEnd = (nm: number): Part | null => (nm >= long - optics.end ? "redEnd" : nm <= short + optics.end ? "violetEnd" : null);
  const bandThickness = (nm: number) => {
    const end = inEnd(nm);
    return swell(s, end ? ["band", end] : ["band"]);
  };
  const id = `spectrum-${el.spec.id}`;
  let band: React.ReactNode;
  if (s.theta <= 0) {
    // One gradient, a stop per pixel; a pulsed end is a taller copy of its part.
    const [x0, x1] = [s.mid[0] - s.len / 2, s.mid[0] + s.len / 2];
    const axis = { nm: p.nm, x0, x1 };
    const stops = Math.ceil(s.len) + 1;
    const rect = (from: number, to: number, h: number, key: string) => (
      <rect key={key} x={from} y={s.mid[1] - h / 2} width={to - from} height={h} fill={`url(#${id})`} />
    );
    band = (
      <>
        <defs>
          <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={x0} y1={0} x2={x1} y2={0}>
            {Array.from({ length: stops }, (_, i) => (
              <stop key={i} offset={i / (stops - 1)} stopColor={nmColor(nmAt(i / (stops - 1)))} />
            ))}
          </linearGradient>
        </defs>
        {rect(x0, x1, swell(s, ["band"]), "band")}
        {s.pulse.redEnd > 0 ? rect(x0, axisX(axis, long - optics.end), bandThickness(long), "redEnd") : null}
        {s.pulse.violetEnd > 0 ? rect(axisX(axis, short + optics.end), x1, bandThickness(short), "violetEnd") : null}
      </>
    );
  } else {
    band = slices(s, [0, 1], (u) => bandThickness(nmAt(u)), (u) => nmColor(nmAt(u))).map((c, i) => (
      <polygon key={i} points={pointsAttr(c.pts)} fill={c.color} />
    ));
  }

  let bridge: React.ReactNode = null;
  if (s.theta > 0 && s.bridge.length) {
    const shareAt = (u: number) => ((u - 1) * s.theta) / (2 * Math.PI - s.theta);
    const lift = optics.whiten * s.pulse.bridge;
    const parts = s.bridge.flatMap(([b0, b1]) =>
      slices(
        s,
        [gapU(s, b0), gapU(s, b1)],
        () => swell(s, ["bridge"]),
        (u) => whiten(purpleAt(p.nm, shareAt(u)), lift),
        // Reach into the band where the bridge meets it, so neither joint shows a seam.
        [b0 <= 0, b1 >= 1],
      ),
    );
    const draw = (key: string) => parts.map((c, i) => <polygon key={`${key}${i}`} points={pointsAttr(c.pts)} fill={c.color} />);
    bridge = (
      <>
        {s.pulse.bridge > 0 ? (
          <>
            <filter id={`${id}-glow`} filterUnits="userSpaceOnUse" x={0} y={0} width="100%" height="100%">
              {/* Visible to about 2σ past the swollen bridge's edge: within
                  optics.glow of the ring at rest. */}
              <feGaussianBlur stdDeviation={(optics.glow - (s.h * (optics.partPulse - 1)) / 2) / 2} />
            </filter>
            <g filter={`url(#${id}-glow)`} opacity={s.pulse.bridge}>
              {draw("glow")}
            </g>
          </>
        ) : null}
        {draw("bridge")}
      </>
    );
  }

  const under = s.namesUnder;
  const namesAxis = { nm: p.nm, x0: under.center[0] - under.w / 2, x1: under.center[0] + under.w / 2 };
  const nameScale = (nm: number) => {
    const end = inEnd(nm);
    return 1 + (mark.pulseScale - 1) * (end ? s.pulse[end] : 0);
  };
  // A name hangs from the band's bottom edge above it, swollen or not, and
  // scales down from its ink top, so a pulse never brings the two closer.
  const nameTop = (nm: number) => under.center[1] + (s.theta > 0 ? under.h : bandThickness(nm)) / 2 + mark.labelGap;
  return (
    <AbsoluteFill style={{ opacity: appear * out }}>
      <Svg>
        {band}
        {bridge}
      </Svg>
      {s.names > 0
        ? names.map(([text, nm]) => (
            <InkLine
              key={text}
              text={text}
              ink={ink(text)}
              x={axisX(namesAxis, nm)}
              y={nameTop(nm) + (nameScale(nm) * (ink(text).b - ink(text).t)) / 2}
              color={color.text}
              opacity={s.names}
              scale={nameScale(nm)}
              kind="name"
            />
          ))
        : null}
    </AbsoluteFill>
  );
};
