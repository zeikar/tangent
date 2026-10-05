import React from "react";
import { AbsoluteFill } from "remotion";
import { Action, bump, ElementTimeline, lerp, mix, phase, Scene, themeColor } from "../storyboard/timeline";
import { color, figure, hotel, stroke, VIDEO } from "../style/theme";
import { Fade, fadeAt, fadeClip, FadedPolyline, lerpFade } from "./fade";
import { arcPoints, lerpPt, Pt, pointsAttr } from "./geometry";
import { InkTex, useTexInk } from "./InkText";
import { lifecycle, Polyline, Svg } from "./shapes";

// A hotel seen from the front: one row of numbered rooms, each holding at
// most one guest, and newcomers waiting outside it. A finite hotel ends in a
// wall; an infinite one fades out to the right (fade.tsx). Guests move all at
// once, sliding straight from place to place. It exposes its live geometry to
// RoomArrows and NumberRow, and hands its room numbers to a NumberRow of n
// (from that row's appear until its gather lands). Spec: storyboard.json →
// components → Hotel.

export type Spot = { at: "room"; n: number } | { at: "door" } | { at: "street"; k: number } | { at: "outside" };
type Props = {
  rooms: number | "infinite";
  origin: Pt; // room 1's left wall, on the floor line
  room: [w: number, h: number];
  fade?: [number, number];
  ground: number; // where the floor line starts on the left
  guests?: { color: string };
  waiting?: { at: "door"; color: string };
};
type Layout = { origin: Pt; room: [number, number]; fade: Fade; ground: number };

// Rooms (and street places) an infinite hotel keeps track of: more than any
// layout shows before its fade ends.
const TRACKED = 48;

// A guest icon, in room widths from its feet: a body with rounded shoulders,
// and a round head.
const BODY = { w: 0.6, h: 0.55, shoulder: 0.2 };
const HEAD = { r: 0.16, y: 0.75 };
export const GUEST_HEIGHT = HEAD.y + HEAD.r;

type Guest = {
  spot: Spot;
  from: Spot;
  move: number; // from `from` to `spot`, 0..1
  color: string;
  opacity: number;
  pulse: number;
  // A street line comes in newcomer by newcomer: guest k shows as the sweep
  // (0..1 across the rooms up to the fade's end) passes room k.
  sweep: { t: number; k: number } | null;
  // A newcomer's number tag stays where it stood, fading as it leaves.
  tag: { k: number; at: Spot; opacity: number } | null;
};

export type HotelState = {
  finite: number | null; // N, or null for an infinite hotel
  w: number;
  roof: number;
  floor: number;
  left: number;
  ground: number;
  fade: Fade;
  rooms: number; // rooms drawn: N, or those starting left of the fade's end
  roomX: (n: number) => number;
  spotAt: (s: Spot) => Pt; // where a guest standing there has its feet
  numberAt: (n: number) => Pt; // a room number's ink center
  shown: number;
  numbers: boolean; // false while a NumberRow holds them
  numberScale: number;
  roomsOpacity: number;
  groundOpacity: number;
  wallWidth: number;
  roomPulse: (n: number) => number;
  lit: (n: number) => number;
  guests: { at: Pt; color: string; opacity: number; pulse: number; tag: { k: number; at: Pt; opacity: number } | null }[];
};

export const hotelOf = (scene: Scene, id: string) => scene.state(id, "Hotel") as HotelState;

// Guests picked by the room they are in: all | odd | even | outside | [n].
const picks = (rooms: unknown, s: Spot) => {
  if (rooms === "outside") return s.at === "outside";
  if (s.at !== "room") return false;
  if (rooms === "all") return true;
  if (rooms === "odd") return s.n % 2 === 1;
  if (rooms === "even") return s.n % 2 === 0;
  if (Array.isArray(rooms)) return rooms.includes(s.n);
  throw new Error(`Hotel: rooms must be all, odd, even, outside or a list, not ${JSON.stringify(rooms)}`);
};

// A NumberRow of n holds this hotel's room numbers from its appear until its
// gather lands.
const handedOff = (scene: Scene, id: string) => {
  let off = false;
  for (const e of scene.elements) {
    if (e.spec.component !== "NumberRow" || e.spec.props.values !== "n") continue;
    for (const a of e.actions) {
      if (scene.frame < a.from) break;
      if (a.action === "appear" && a.params.from === id) off = true;
      if (a.action === "gather" && a.params.into === id && scene.frame >= a.to) off = false;
    }
  }
  return off;
};

export const hotelState = (el: ElementTimeline, scene: Scene): HotelState => {
  const p = el.spec.props as Props;
  const { frame } = scene;
  const finite = p.rooms === "infinite" ? null : p.rooms;
  if (finite === null && !p.fade) throw new Error(`Hotel ${el.spec.id}: an infinite hotel needs a fade`);
  const tracked = finite ?? TRACKED;
  let layout: Layout = { origin: p.origin, room: p.room, fade: p.fade ?? null, ground: p.ground };
  const newGuest = (spot: Spot, c: string): Guest => ({ spot, from: spot, move: 1, color: c, opacity: 1, pulse: 0, sweep: null, tag: null });
  let guests: Guest[] = [];
  if (p.guests) for (let n = 1; n <= tracked; n++) guests.push(newGuest({ at: "room", n }, themeColor(p.guests.color)));
  if (p.waiting) guests.push(newGuest({ at: "door" }, themeColor(p.waiting.color)));
  let numberScale = 1;
  let roomsOpacity = 1;
  let groundOpacity = 1;
  let wallPulse = 0;
  // Room pulses, read with the final geometry (a wave runs along it).
  const roomPulses: ((n: number, roomX: (n: number) => number, w: number, end: number) => number)[] = [];
  const lights: { on: (n: number) => boolean; level: number; off: Map<number, number> }[] = [];

  // Guests move together, each to where `to` sends it (null: it stays). A
  // light goes off as its room's guest lands.
  const moveAll = (a: Action, to: (g: Guest) => Spot | null) => {
    const t = phase(a, frame);
    const landing = phase(a, frame, 0.7, 1);
    guests = guests.flatMap((g) => {
      const spot = to(g);
      if (!spot) return [g];
      if (spot.at === "room" && spot.n > tracked) return []; // never on screen
      if (spot.at === "room") for (const l of lights) if (l.on(spot.n)) l.off.set(spot.n, Math.max(l.off.get(spot.n) ?? 0, landing));
      return [{ ...g, from: g.spot, spot, move: t }];
    });
  };

  const { appear, out } = lifecycle(el, frame, (a) => {
    const q = a.params;
    const t = phase(a, frame);
    switch (a.action) {
      case "moveTo": {
        const room = q.room ?? layout.room;
        layout = {
          origin: lerpPt(layout.origin, q.origin ?? layout.origin, t),
          room: [lerp(layout.room[0], room[0], t), lerp(layout.room[1], room[1], t)],
          fade: lerpFade(layout.fade, q.fade ?? layout.fade, t),
          ground: lerp(layout.ground, q.ground ?? layout.ground, t),
        };
        break;
      }
      case "shift": {
        const map = q.map === "n+1" ? (n: number) => n + 1 : q.map === "2n" ? (n: number) => 2 * n : null;
        if (!map) throw new Error(`Hotel ${el.spec.id}: shift map must be n+1 or 2n`);
        moveAll(a, (g) =>
          g.spot.at !== "room" ? null : finite !== null && map(g.spot.n) > finite ? { at: "outside" } : { at: "room", n: map(g.spot.n) },
        );
        break;
      }
      case "admit": {
        if (q.map === "1") moveAll(a, (g) => (g.spot.at === "door" ? { at: "room", n: 1 } : null));
        else if (q.map === "2k-1") {
          const leaving = 1 - phase(a, frame, 0, 0.3);
          for (const g of guests) if (g.tag && g.spot.at === "street") g.tag = { ...g.tag, opacity: g.tag.opacity * leaving };
          moveAll(a, (g) => (g.spot.at === "street" ? { at: "room", n: 2 * g.spot.k - 1 } : null));
        } else throw new Error(`Hotel ${el.spec.id}: admit map must be 1 or 2k-1`);
        break;
      }
      case "lineUp": {
        const c = themeColor(q.color);
        if (q.at === "street") {
          if (q.count !== "infinite") throw new Error(`Hotel ${el.spec.id}: a street line is infinite`);
          for (let k = 1; k <= tracked; k++) {
            const spot: Spot = { at: "street", k };
            guests.push({ ...newGuest(spot, c), sweep: { t, k }, tag: q.tags ? { k, at: spot, opacity: 1 } : null });
          }
        } else if (q.at === "door") guests.push({ ...newGuest({ at: "door" }, c), opacity: t });
        else throw new Error(`Hotel ${el.spec.id}: lineUp at street or door`);
        break;
      }
      case "setGuests":
        for (const g of guests) {
          if (!picks(q.rooms, g.spot)) continue;
          if (q.color) g.color = mix(g.color, themeColor(q.color), t);
          if (q.opacity !== undefined) g.opacity = lerp(g.opacity, q.opacity, t);
        }
        break;
      case "pulse": {
        const b = bump(a, frame);
        if (q.part === "guests") {
          for (const g of guests) if (picks(q.rooms ?? "all", g.spot)) g.pulse = Math.max(g.pulse, b);
        } else if (q.part === "waiting") {
          for (const g of guests) if (g.spot.at === "door" || g.spot.at === "street") g.pulse = Math.max(g.pulse, b);
        } else if (q.part === "numbers") numberScale = Math.max(numberScale, lerp(1, hotel.numberPulse, b));
        else if (q.part === "wall") wallPulse = Math.max(wallPulse, b);
        else if (q.part === "rooms") {
          const rooms: number[] | undefined = q.rooms;
          // A wave: a glow running from room 1 on past the last room drawn.
          roomPulses.push(
            q.wave
              ? (n, roomX, w, end) => {
                  const half = hotel.wave * w;
                  const at = lerp(roomX(1) - w / 2 - half, end + half, t);
                  return Math.max(0, 1 - Math.abs(roomX(n) - at) / half);
                }
              : (n) => (!rooms || rooms.includes(n) ? b : 0),
          );
        } else throw new Error(`Hotel ${el.spec.id}: unknown pulse part ${q.part}`);
        break;
      }
      case "light": {
        const rooms = q.rooms;
        const on = rooms === "odd" ? (n: number) => n % 2 === 1 : Array.isArray(rooms) ? (n: number) => rooms.includes(n) : null;
        if (!on) throw new Error(`Hotel ${el.spec.id}: light rooms must be odd or a list`);
        lights.push({ on, level: t, off: new Map() });
        break;
      }
      case "setStyle":
        if (q.rooms !== undefined) roomsOpacity = lerp(roomsOpacity, q.rooms, t);
        if (q.ground !== undefined) groundOpacity = lerp(groundOpacity, q.ground, t);
        break;
      default:
        throw new Error(`Hotel ${el.spec.id}: unknown action ${a.action}`);
    }
  });

  const [w, h] = layout.room;
  const [left, floor] = layout.origin;
  const roof = floor - h;
  const roomX = (n: number) => left + (n - 0.5) * w;
  const end = finite !== null ? left + finite * w : layout.fade![1];
  const rooms = finite ?? Math.ceil((end - left) / w);
  if (rooms > tracked) throw new Error(`Hotel ${el.spec.id}: ${rooms} rooms on screen, more than the ${tracked} tracked`);
  const spotAt = (s: Spot): Pt => {
    if (s.at === "room") return [roomX(s.n), floor];
    if (s.at === "door") return [left - w / 2, floor];
    if (s.at === "street") return [roomX(s.k), floor + hotel.street];
    if (finite === null) throw new Error(`Hotel ${el.spec.id}: an infinite hotel has no outside spot`);
    return [left + finite * w + w / 2, floor];
  };
  const visibleRooms = (end - left) / w;
  return {
    finite,
    w,
    roof,
    floor,
    left,
    ground: layout.ground,
    fade: layout.fade,
    rooms,
    roomX,
    spotAt,
    numberAt: (n) => [roomX(n), roof + hotel.numberDrop],
    shown: appear * out,
    numbers: !handedOff(scene, el.spec.id),
    numberScale,
    roomsOpacity,
    groundOpacity,
    wallWidth: lerp(stroke.sheet, hotel.wallPulse, wallPulse),
    roomPulse: (n) => Math.max(0, ...roomPulses.map((f) => f(n, roomX, w, end))),
    lit: (n) => Math.max(0, ...lights.map((l) => (l.on(n) ? l.level * (1 - (l.off.get(n) ?? 0)) : 0))),
    guests: guests.map((g) => {
      const shows = g.sweep ? Math.min(1, Math.max(0, g.sweep.t * visibleRooms - (g.sweep.k - 1))) : 1;
      return {
        at: g.move >= 1 ? spotAt(g.spot) : lerpPt(spotAt(g.from), spotAt(g.spot), g.move),
        color: g.color,
        opacity: g.opacity * shows,
        pulse: g.pulse,
        tag: g.tag && { k: g.tag.k, at: spotAt(g.tag.at), opacity: g.tag.opacity * shows },
      };
    }),
  };
};

// A guest's outline: the body from its bottom-left corner round the
// shoulders, and the head, both closed rings.
const guestShape = ([cx, feet]: Pt, w: number) => {
  const [half, top, r] = [(BODY.w * w) / 2, feet - BODY.h * w, BODY.shoulder * w];
  const start: Pt = [cx - half, feet];
  return {
    body: [start, ...arcPoints([cx - half + r, top + r], r, 180, 90), ...arcPoints([cx + half - r, top + r], r, 90, 0), [cx + half, feet], start] as Pt[],
    head: arcPoints([cx, feet - HEAD.y * w], HEAD.r * w, 90, 450),
  };
};

const GuestIcon: React.FC<{ at: Pt; w: number; color: string; opacity: number; pulse: number }> = ({ at, w, color: c, opacity, pulse }) => {
  const { body, head } = guestShape(at, w);
  const fillOpacity = lerp(figure.guest, figure.pulse, pulse);
  const width = lerp(stroke.line, hotel.guestPulse, pulse);
  return (
    <g opacity={opacity}>
      <polygon points={pointsAttr(body)} fill={c} fillOpacity={fillOpacity} />
      <polygon points={pointsAttr(head)} fill={c} fillOpacity={fillOpacity} />
      <Polyline pts={body} color={c} width={width} closed />
      <Polyline pts={head} color={c} width={width} closed />
    </g>
  );
};

export const Hotel: React.FC<{ el: ElementTimeline; scene: Scene }> = ({ el, scene }) => {
  const s = hotelOf(scene, el.spec.id);
  const fadeOf = (x: number) => fadeAt(s.fade, x);
  const roomList = Array.from({ length: s.rooms }, (_, i) => i + 1);
  const numbers = s.shown > 0 && s.numbers ? roomList.filter((n) => fadeOf(s.roomX(n)) > 0) : [];
  const tags = s.shown > 0 ? s.guests.flatMap((g) => (g.tag && g.tag.opacity * fadeOf(g.tag.at[0]) > 0 ? [{ ...g.tag, color: g.color }] : [])) : [];
  const { ink, measuring } = useTexInk(`hotel ${el.spec.id}`, [...numbers, ...tags.map((t) => t.k)].map(String), hotel.number);
  if (s.shown <= 0) return null;
  if (measuring.length) return <AbsoluteFill>{measuring}</AbsoluteFill>;

  const { w, roof, floor, left } = s;
  const wallX = (k: number) => left + k * w;
  const outline = (pulse: number) => mix(color.muted, color.text, pulse);
  const half = stroke.line / 2;
  // Room n's roof and floor; the walls between rooms, each lit by its brighter
  // neighbour; past the rooms on the left, the floor out to the door.
  const segments = roomList.flatMap((n) => {
    const c = outline(s.roomPulse(n));
    const [x0, x1] = [wallX(n - 1), wallX(n)];
    return [
      { key: `roof${n}`, pts: [[x0, roof], [x1, roof]] as Pt[], c, o: s.roomsOpacity },
      { key: `floor${n}`, pts: [[x0, floor], [x1, floor]] as Pt[], c, o: s.groundOpacity },
    ];
  });
  const walls = Array.from({ length: (s.finite ?? s.rooms + 1) }, (_, k) => k).flatMap((k) => {
    const near = [k, k + 1].filter((n) => n >= 1 && n <= s.rooms);
    const c = outline(Math.max(0, ...near.map(s.roomPulse)));
    return [{ key: `wall${k}`, pts: [[wallX(k), floor + half], [wallX(k), roof - half]] as Pt[], c, o: s.roomsOpacity }];
  });
  const outside = s.finite !== null ? s.spotAt({ at: "outside" })[0] + hotel.floorPast * w : null;
  const floorEnds = [
    { key: "door", pts: [[s.ground, floor], [left, floor]] as Pt[], c: color.muted, o: s.groundOpacity },
    ...(outside !== null ? [{ key: "past", pts: [[wallX(s.finite!), floor], [outside, floor]] as Pt[], c: color.muted, o: s.groundOpacity }] : []),
  ];
  const lit = roomList.filter((n) => s.lit(n) > 0);
  const fadeEnd = s.fade ? s.fade[1] : Infinity;

  return (
    <AbsoluteFill style={{ opacity: s.shown, clipPath: fadeClip(s.fade, VIDEO.width) }}>
      <Svg>
        {lit.map((n) => {
          const [x0, x1] = [wallX(n - 1), Math.min(wallX(n), fadeEnd)];
          return (
            <rect
              key={`litfill${n}`}
              x={x0}
              y={roof}
              width={Math.max(0, x1 - x0)}
              height={floor - roof}
              fill={color.yellow}
              fillOpacity={hotel.lit * s.lit(n) * fadeOf(s.roomX(n))}
            />
          );
        })}
        {[...segments, ...walls, ...floorEnds].map((g) => (
          <FadedPolyline key={g.key} pts={g.pts} fade={s.fade} color={g.c} width={stroke.line} opacity={g.o} />
        ))}
        {s.finite !== null ? (
          <line
            x1={wallX(s.finite)}
            y1={floor + half}
            x2={wallX(s.finite)}
            y2={roof - half}
            stroke={color.text}
            strokeWidth={s.wallWidth}
            opacity={s.roomsOpacity}
          />
        ) : null}
        {lit.map((n) => {
          const [x0, x1] = [wallX(n - 1), wallX(n)];
          // From the floor's middle, so every corner is a join.
          const ring: Pt[] = [[s.roomX(n), floor], [x1, floor], [x1, roof], [x0, roof], [x0, floor], [s.roomX(n), floor]];
          return <FadedPolyline key={`lit${n}`} pts={ring} fade={s.fade} color={color.yellow} width={stroke.line} opacity={s.lit(n)} />;
        })}
        {s.guests.map((g, i) => {
          const o = g.opacity * fadeOf(g.at[0]);
          return o > 0 ? <GuestIcon key={i} at={g.at} w={w} color={g.color} opacity={o} pulse={g.pulse} /> : null;
        })}
      </Svg>
      {numbers.map((n) => {
        const [x, y] = s.numberAt(n);
        return (
          <InkTex
            key={`n${n}`}
            tex={String(n)}
            ink={ink(String(n))}
            fontSize={hotel.number}
            x={x}
            y={y}
            color={color.text}
            opacity={fadeOf(x)}
            scale={s.numberScale}
            kind="number"
          />
        );
      })}
      {tags.map((t) => {
        const i = ink(String(t.k));
        return (
          <InkTex
            key={`t${t.k}`}
            tex={String(t.k)}
            ink={i}
            fontSize={hotel.number}
            x={t.at[0]}
            y={t.at[1] + hotel.tagGap + (i.b - i.t) / 2}
            color={t.color}
            opacity={t.opacity * fadeOf(t.at[0])}
            kind="tag"
          />
        );
      })}
    </AbsoluteFill>
  );
};
