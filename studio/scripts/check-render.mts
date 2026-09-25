// Checks an episode's render.mp4 against its storyboard and the delivery
// rules. Thresholds come from `checks` (and content, zone, VIDEO) in
// src/style/theme.ts. Pixels come from the render; exact element geometry
// from the player itself, run in the browser without screenshots
// (scripts/probe.mts), which is why freshness also compares the studio code
// the render was made with.
//
//   node scripts/check-render.mts ../episodes/<slug> [--out <dir>]
// Writes check.json, check.md and check/ (a labeled contact sheet of the
// beat ends, plus the frames and before/after pairs that failing or warning
// checks cite, offending regions boxed in red) into the episode folder, or
// into --out. The files hold no run time or timestamp, so re-checking an
// unchanged render rewrites them byte for byte. Exits 1 if any check fails.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { checks, content, VIDEO, zone } from "../src/style/theme.ts";
import { type Box, envelopeLag, ffprobe, levels, loudness, pcm, pixelPass } from "./check/media.mts";
import { readTag, studioSha256 } from "./fingerprint.mts";
import { bundleStudio, type ElementSnap, type FrameSnap, probeFrames, type TextItem } from "./probe.mts";

type Status = "pass" | "warn" | "fail" | "skip";
// A cited frame (with boxes), or a pair of frames (labeled before/after
// unless the cite names them).
type Cite = { frame: number; boxes?: Box[]; pair?: [number, number]; pairLabels?: [string, string]; note: string };
type Result = { id: string; status: Status; summary: string; details?: unknown; cites?: Cite[] };
type Timeline = {
  elements: { id: string; component: string; start: number; end: number | null; actions: { action: string; from: number; to: number }[] }[];
  captions: { text: string; from: number; to: number }[];
};

const args = process.argv.slice(2);
const outAt = args.findIndex((a) => a === "--out" || a.startsWith("--out="));
const outArg = outAt < 0 ? undefined : args[outAt].startsWith("--out=") ? args[outAt].slice(6) : args[outAt + 1];
const arg = args.find((a, i) => !a.startsWith("--") && (outAt < 0 || i !== outAt + 1));
if (!arg) throw new Error("usage: node scripts/check-render.mts <episode dir> [--out <dir>]");
const started = Date.now();
const episode = resolve(arg);
const out = resolve(outArg ?? episode);
const slug = basename(episode);
const render = join(episode, "render.mp4");
for (const [name, fix] of [
  ["render.mp4", "run render.mts"],
  ["storyboard.json", "is this an episode folder?"],
  ["cues.json", "run build-cues.py"],
  ["words.json", "run build-cues.py"],
  ["narration.mp3", "run build-cues.py"],
]) {
  if (!existsSync(join(episode, name))) throw new Error(`${episode}/${name} is missing: ${fix}`);
}
const read = (name: string) => readFileSync(join(episode, name));
const storyboardBytes = read("storyboard.json");
const storyboard = JSON.parse(storyboardBytes.toString("utf8"));
const cues = JSON.parse(read("cues.json").toString("utf8"));
const words: { word: string; start: number; end: number }[] = JSON.parse(read("words.json").toString("utf8"));
const storyboardSha256 = createHash("sha256").update(storyboardBytes).digest("hex");
const studioHash = studioSha256();
const fps = VIDEO.fps;

const results: Result[] = [];
const add = (r: Result) => results.push(r);
const worst = (s: Status[]): Status => (s.includes("fail") ? "fail" : s.includes("warn") ? "warn" : s.length ? "pass" : "skip");
// Consecutive frames grouped into runs.
const runsOf = (frames: number[]) => {
  const out: number[][] = [];
  for (const f of frames) {
    const last = out[out.length - 1];
    if (last && f === last[last.length - 1] + 1) last.push(f);
    else out.push([f]);
  }
  return out;
};
const ranges = (frames: number[]) => runsOf(frames).map((r) => (r.length === 1 ? `f${r[0]}` : `f${r[0]}–${r[r.length - 1]}`)).join(", ");
const r0 = (n: number) => Math.round(n);
const sign = (n: number) => `${n > 0 ? "+" : ""}${r0(n)}`;

// ---- Freshness: the render, cues and studio code all match ------------------
const info = ffprobe(render);
{
  const tag = readTag(info.format.tags?.comment);
  const problems: string[] = [];
  const unknown: string[] = [];
  if (cues.storyboardSha256 !== storyboardSha256) problems.push("cues.json was built from another storyboard.json (rerun build-cues.py)");
  if (!tag.storyboard) unknown.push("no storyboard hash");
  else if (tag.storyboard !== storyboardSha256) problems.push("render.mp4 was rendered from another storyboard.json (rerun render.mts)");
  if (!tag.studio) unknown.push("no studio-code hash");
  else if (tag.studio !== studioHash)
    problems.push("render.mp4 was rendered with other studio code, so the geometry checks measure code it doesn't show (rerun render.mts)");
  add({
    id: "freshness",
    status: problems.length ? "fail" : unknown.length ? "warn" : "pass",
    summary: problems.length
      ? problems.join("; ")
      : unknown.length
        ? `render.mp4 carries ${unknown.join(" and ")} (made before render.mts stamped them): the geometry checks may not describe it`
        : "render.mp4, cues.json and the studio code all match this storyboard.json",
  });
}

// ---- Technical --------------------------------------------------------------
const video = info.streams.find((s) => s.codec_type === "video");
const audio = info.streams.find((s) => s.codec_type === "audio");
const renderPcm = audio ? pcm(render) : null;
{
  const problems: string[] = [];
  const [num, den] = (video?.r_frame_rate ?? "0/1").split("/").map(Number);
  const vDur = Number(video?.duration ?? info.format.duration);
  const d = checks.delivery;
  if (!video) problems.push("no video stream");
  else {
    if (video.width !== VIDEO.width || video.height !== VIDEO.height) problems.push(`${video.width}×${video.height}, not ${VIDEO.width}×${VIDEO.height}`);
    if (num / den !== fps) problems.push(`${num / den} fps, not ${fps}`);
    if (Number(video.nb_frames) !== cues.durationInFrames) problems.push(`${video.nb_frames} frames, cues.json says ${cues.durationInFrames}`);
    if (vDur > checks.maxSeconds) problems.push(`${vDur.toFixed(2)} s, over ${checks.maxSeconds} s`);
    if (video.pix_fmt !== d.pixFmt) problems.push(`pixel format ${video.pix_fmt}, not ${d.pixFmt}`);
    const tags = [video.color_space, video.color_primaries, video.color_transfer];
    if (tags.some((t) => t !== d.colorSpace)) problems.push(`color tags ${tags.join("/")}, not ${d.colorSpace}`);
    if (video.color_range !== d.colorRange) problems.push(`color range ${video.color_range}, not ${d.colorRange}`);
  }
  let tail = "";
  if (!audio || !renderPcm) problems.push("no audio stream");
  else {
    const aDur = Number(audio.duration);
    if (Number(audio.sample_rate) !== d.audioRate) problems.push(`audio at ${audio.sample_rate} Hz, not ${d.audioRate}`);
    if (aDur < vDur - 1 / fps) problems.push(`audio ends at ${aDur.toFixed(2)} s, video at ${vDur.toFixed(2)} s`);
    const tailDb = Math.max(...levels(renderPcm).slice(-10));
    tail = `, last 100 ms at ${tailDb.toFixed(0)} dBFS`;
    if (tailDb > checks.tailSilenceDb) problems.push(`audio still sounding at the end (${tailDb.toFixed(0)} dBFS): cut off?`);
    const lastEnd = words[words.length - 1]?.end ?? 0;
    if (lastEnd > aDur) problems.push(`last word ends at ${lastEnd} s, after the audio (${aDur.toFixed(2)} s)`);
  }
  add({
    id: "technical",
    status: problems.length ? "fail" : "pass",
    summary: problems.length
      ? problems.join("; ")
      : `${video!.width}×${video!.height} ${video!.pix_fmt} ${d.colorSpace} ${video!.color_range}, ${fps} fps, ${video!.nb_frames} frames (${vDur.toFixed(2)} s); audio ${audio!.sample_rate} Hz${tail}`,
  });
}

// ---- Pixels and geometry (run together) --------------------------------------
const beatFirstWord: { beat: string; frame: number; hasCue: boolean }[] = [];
{
  let i = 0;
  storyboard.beats.forEach((b: { id: string; readAloud: string }, k: number) => {
    // words.json is rounded to ms, so its frame can be one off the cue's.
    const near = cues.beats[k].cues.map((c: { frame: number }) => c.frame).filter((f: number) => Math.abs(f - words[i].start * fps) <= 1);
    const frame = near.length ? Math.min(...near) : Math.round(words[i].start * fps);
    beatFirstWord.push({ beat: b.id, frame, hasCue: near.length > 0 });
    i += b.readAloud.split(/\s+/).length;
  });
}
const cueFrames: { beat: string; frame: number; what: string }[] = cues.beats.flatMap(
  (b: { id: string; cues: { target: string; action: string; frame: number }[] }) =>
    b.cues.map((c) => ({ beat: b.id, frame: c.frame, what: `${c.target}.${c.action}` })),
);
const loopPromised = storyboard.loop === true;

const serveUrl = bundleStudio();
const [snaps, px] = await Promise.all([
  probeFrames({ serveUrl, id: slug, inputProps: { showSafeArea: false, storyboard, cues } }),
  pixelPass(render, {
    width: VIDEO.width,
    height: VIDEO.height,
    // Visual ink may use the gap under zone.visual (a rising label dips into
    // it); it must stay out of the caption band.
    visual: { top: zone.visual.top, bottom: zone.caption.top - 1 },
    caption: zone.caption,
    left: content.left,
    right: content.right,
    inkLevel: checks.inkLevel,
    changeLevel: checks.changeLevel,
    changePixels: checks.changePixels,
    reactFrames: [...new Set([...beatFirstWord.filter((b) => b.hasCue).map((b) => b.frame), ...cueFrames.map((c) => c.frame)])],
    reactionWindow: checks.reactionFrames + 12,
    loop: loopPromised,
  }),
]);
const timeline = snaps[0].extra as Timeline;
const componentOf = new Map(timeline.elements.map((e) => [e.id, e.component]));

// Geometry helpers over probe snapshots.
const inflate = ([l, t, r, b]: Box, d: number): Box => [l - d, t - d, r + d, b + d];
const boxesMeet = (a: Box, b: Box) => Math.min(a[2], b[2]) - Math.max(a[0], b[0]) > 0 && Math.min(a[3], b[3]) - Math.max(a[1], b[1]) > 0;
const union = (bs: Box[]): Box | undefined =>
  bs.length ? [Math.min(...bs.map((b) => b[0])), Math.min(...bs.map((b) => b[1])), Math.max(...bs.map((b) => b[2])), Math.max(...bs.map((b) => b[3]))] : undefined;
const segmentHitsBox = (x1: number, y1: number, x2: number, y2: number, [l, t, r, b]: Box) => {
  let t0 = 0;
  let t1 = 1;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const clip = (p: number, q: number) => {
    if (p === 0) return q >= 0;
    const u = q / p;
    if (p < 0) {
      if (u > t1) return false;
      if (u > t0) t0 = u;
    } else {
      if (u < t0) return false;
      if (u < t1) t1 = u;
    }
    return true;
  };
  return clip(-dx, x1 - l) && clip(dx, r - x1) && clip(-dy, y1 - t) && clip(dy, b - y1);
};
const pointToSegment = (px0: number, py0: number, x1: number, y1: number, x2: number, y2: number) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  const t = len2 ? Math.max(0, Math.min(1, ((px0 - x1) * dx + (py0 - y1) * dy) / len2)) : 0;
  return Math.hypot(px0 - (x1 + t * dx), py0 - (y1 + t * dy));
};
const pointToBox = (x: number, y: number, [l, t, r, b]: Box) => Math.hypot(Math.max(l - x, 0, x - r), Math.max(t - y, 0, y - b));
// Gap between a box and a stroked line's outer edge.
const boxToLine = (box: Box, [x1, y1, x2, y2, w]: number[]) => {
  if (segmentHitsBox(x1, y1, x2, y2, box)) return 0;
  const corners: [number, number][] = [[box[0], box[1]], [box[2], box[1]], [box[2], box[3]], [box[0], box[3]]];
  const d = Math.min(pointToBox(x1, y1, box), pointToBox(x2, y2, box), ...corners.map(([x, y]) => pointToSegment(x, y, x1, y1, x2, y2)));
  return Math.max(0, d - w / 2);
};
// Does line b lie along line a's extension (an overlay tracing the same edge,
// like B7's half outline on its sheet)?
const pointToLine = (x: number, y: number, [x1, y1, x2, y2]: number[]) =>
  Math.abs((x2 - x1) * (y1 - y) - (x1 - x) * (y2 - y1)) / (Math.hypot(x2 - x1, y2 - y1) || 1);
const collinear = (a: number[], b: number[]) => pointToLine(b[0], b[1], a) <= 4 && pointToLine(b[2], b[3], a) <= 4;
// Separating axes: a convex polygon (flat x,y list) against a box.
const polygonMeetsBox = (poly: number[], box: Box) => {
  const pts = Array.from({ length: poly.length / 2 }, (_, i) => [poly[2 * i], poly[2 * i + 1]]);
  const corners = [[box[0], box[1]], [box[2], box[1]], [box[2], box[3]], [box[0], box[3]]];
  const axes = [[1, 0], [0, 1], ...pts.map((p, i) => {
    const q = pts[(i + 1) % pts.length];
    return [q[1] - p[1], p[0] - q[0]];
  })];
  return axes.every(([ax, ay]) => {
    const a = pts.map(([x, y]) => x * ax + y * ay);
    const b = corners.map(([x, y]) => x * ax + y * ay);
    return Math.min(Math.max(...a), Math.max(...b)) - Math.max(Math.min(...a), Math.min(...b)) > 0;
  });
};
const fillMeetsBox = (f: (number | number[] | undefined)[], box: Box) =>
  Array.isArray(f[5]) ? polygonMeetsBox(f[5], box) : boxesMeet([f[0], f[1], f[2], f[3]] as Box, box);
const lineBox = (l: number[]): Box => [Math.min(l[0], l[2]) - l[4] / 2, Math.min(l[1], l[3]) - l[4] / 2, Math.max(l[0], l[2]) + l[4] / 2, Math.max(l[1], l[3]) + l[4] / 2];
const elementBox = (el: ElementSnap | undefined, min = 0.05) =>
  el &&
  union([
    ...el.lines.filter((l) => l[5] >= min).map(lineBox),
    ...el.fills.filter((f) => f[4] >= min).map((f) => [f[0], f[1], f[2], f[3]] as Box),
    ...el.texts.filter((t) => t.opacity >= min).map((t) => t.box),
  ]);
const visibleOpacity = (snap: FrameSnap, id: string) => {
  const el = snap.els.find((e) => e.id === id);
  if (!el) return 0;
  return Math.max(0, ...el.lines.map((l) => l[5]), ...el.fills.map((f) => f[4]), ...el.texts.map((t) => t.opacity));
};

// ---- Bounds -------------------------------------------------------------------
{
  // One cited frame per run of offending frames: its worst.
  const byFrame = new Map(px.outside.map((o) => [o.frame, o]));
  const runCites: Cite[] = runsOf(px.outside.map((o) => o.frame))
    .map((run) => run.map((f) => byFrame.get(f)!).reduce((a, b) => (b.pixels > a.pixels ? b : a)))
    .sort((a, b) => b.pixels - a.pixels)
    .map((o) => ({ frame: o.frame, boxes: [o.box], note: `bounds: ${o.pixels} ink px outside, x ${o.box[0]}–${o.box[2] - 1}, y ${o.box[1]}–${o.box[3] - 1}` }));
  // Visual elements reaching into the caption band (pixels can't tell them from captions).
  const intrusions: { frame: number; id: string; bottom: number; box: Box }[] = [];
  for (const s of snaps) {
    for (const el of s.els) {
      if (el.id === "captions") continue;
      const box = elementBox(el, 0.1);
      if (box && box[3] > zone.caption.top) intrusions.push({ frame: s.frame, id: el.id, bottom: box[3], box });
    }
  }
  const intrusionCites = runsOf([...new Set(intrusions.map((i) => i.frame))]).map((run) => {
    const i = intrusions.find((x) => x.frame === run[0])!;
    return { frame: i.frame, boxes: [i.box], note: `bounds: ${i.id} reaches y ${r0(i.bottom)}, into the caption band` };
  });
  const vis = px.visual.filter((b): b is Box => b !== null);
  const span = vis.length
    ? `visual ink x ${Math.min(...vis.map((b) => b[0]))}–${Math.max(...vis.map((b) => b[2])) - 1}, y ${Math.min(...vis.map((b) => b[1]))}–${Math.max(...vis.map((b) => b[3])) - 1}`
    : "no visual ink";
  add({
    id: "bounds",
    status: px.outside.length || intrusions.length ? "fail" : "pass",
    summary: px.outside.length || intrusions.length
      ? `${px.outside.length} frames put ink outside x ${content.left}–${content.right} / the zones (${ranges(px.outside.map((o) => o.frame))})` +
        (intrusions.length ? `; ${new Set(intrusions.map((i) => i.id)).size} elements reach into the caption band (${ranges([...new Set(intrusions.map((i) => i.frame))])})` : "")
      : `all ${px.frames} frames inside x ${content.left}–${content.right}, visual ink below y ${zone.visual.top} and above the caption band, captions in y ${zone.caption.top}–${zone.caption.bottom}; ${span}`,
    cites: [...runCites, ...intrusionCites],
  });
}

// ---- Centering at beat ends: all ink, and the picture without its edge labels ----------
{
  const rows = cues.beats.map((b: { id: string; endFrame: number }) => {
    const box = px.visual[b.endFrame];
    const els = snaps[b.endFrame].els.filter((e) => e.id !== "captions");
    const picture = union(
      els.flatMap((e) => [
        ...e.lines.filter((l) => l[5] >= 0.1).map(lineBox),
        ...e.fills.filter((f) => f[4] >= 0.1).map((f) => [f[0], f[1], f[2], f[3]] as Box),
        ...e.texts.filter((t) => t.opacity >= 0.1 && t.kind !== "edge-label").map((t) => t.box),
      ]),
    );
    const off = box ? (box[0] + box[2]) / 2 - content.centerX : null;
    const pictureOff = picture ? (picture[0] + picture[2]) / 2 - content.centerX : null;
    const bad = [off, pictureOff].some((o) => o !== null && Math.abs(o) > checks.centerTolerance);
    return { beat: b.id, frame: b.endFrame, off, pictureOff, status: (off === null ? "skip" : bad ? "fail" : "pass") as Status, box, picture };
  });
  add({
    id: "centering",
    status: worst(rows.map((r: { status: Status }) => r.status).filter((s: Status) => s !== "skip")),
    summary:
      rows
        .map((r: { beat: string; off: number | null; pictureOff: number | null }) =>
          `${r.beat} ${r.off === null ? "—" : sign(r.off)}${r.pictureOff === null ? "" : `/${sign(r.pictureOff)}`}`,
        )
        .join(", ") +
      ` (px off x ${content.centerX}: all ink / picture without edge labels; tolerance ±${checks.centerTolerance})`,
    details: rows.map(({ box, picture, ...r }: { box: unknown; picture: unknown }) => r),
    cites: rows
      .filter((r: { status: Status }) => r.status === "fail")
      .sort((a: { off: number; pictureOff: number }, b: { off: number; pictureOff: number }) =>
        Math.max(Math.abs(b.off), Math.abs(b.pictureOff ?? 0)) - Math.max(Math.abs(a.off), Math.abs(a.pictureOff ?? 0)),
      )
      .map((r: { beat: string; frame: number; off: number; pictureOff: number | null; box: Box; picture?: Box }) => ({
        frame: r.frame,
        boxes: [r.box, ...(r.picture ? [r.picture] : [])],
        note: `centering: ${r.beat} end, ink ${sign(r.off)} px, picture without edge labels ${r.pictureOff === null ? "—" : sign(r.pictureOff)} px`,
      })),
  });
}

// ---- Legibility (measured where each text is fully visible) ------------------------------
{
  type G = { id: string; kind: string; text: string; char: string; height: number; frame: number; box: Box; full: boolean };
  const smallest = new Map<string, G>();
  for (const s of snaps) {
    for (const el of s.els) {
      for (const t of el.texts) {
        if (t.opacity < 0.5 || !t.glyph) continue;
        const key = `${el.id}|${t.kind}|${t.text}`;
        const full = t.opacity >= 0.9;
        const cur = smallest.get(key);
        if (!cur || (full && !cur.full) || (full === cur.full && t.glyph[1] < cur.height))
          smallest.set(key, { id: el.id, kind: t.kind, text: t.text, char: t.glyph[0], height: t.glyph[1], frame: s.frame, box: t.box, full });
      }
    }
  }
  const all = [...smallest.values()].sort((a, b) => a.height - b.height);
  const small = all.filter((g) => g.height < checks.glyphMin);
  const min = all[0];
  add({
    id: "legibility",
    status: small.length ? "fail" : "pass",
    summary: small.length
      ? `${small.length} text items have glyphs under ${checks.glyphMin} px: ` +
        small.slice(0, 5).map((g) => `${g.id} "${g.text}" ("${g.char}" ${g.height} px)`).join("; ")
      : `smallest glyph ${min ? `"${min.char}" ${min.height} px in ${min.id} "${min.text}"` : "none"} (floor ${checks.glyphMin} px, ${all.length} text items)`,
    details: all.slice(0, 20).map(({ box, full, ...g }) => g),
    cites: small.map((g) => ({ frame: g.frame, boxes: [g.box], note: `legibility: ${g.id} "${g.text}", "${g.char}" is ${g.height} px` })),
  });
}

// ---- Overlaps --------------------------------------------------------------------------------
{
  // Allowed inside one element: an edge label beside its own sheet's edges, an
  // equation's text inside its own box and its own morph layers, a dimension
  // or number-line label on its own line or tick, and any two texts of one
  // element while one fades.
  const allowedOwnLine = (component: string, t: TextItem) =>
    (component === "PaperRect" && t.kind === "edge-label") || ["Equation", "Dimension", "NumberLine"].includes(component);
  const allowedOwnText = (component: string, a: TextItem, b: TextItem) => component === "Equation" || a.opacity < 0.9 || b.opacity < 0.9;

  type Hit = { frames: number[]; moving: boolean[]; boxes: Box[] };
  const hits = new Map<string, Hit>();
  let prev = new Map<string, string>();
  for (const s of snaps) {
    const shape = new Map(s.els.map((e) => [e.id, JSON.stringify([e.lines.map((l) => l.slice(0, 4)), e.fills.map((f) => f.slice(0, 4))])]));
    const moving = (id: string) => shape.get(id) !== prev.get(id);
    const note = (key: string, isMoving: boolean, boxes: Box[]) => {
      const h = hits.get(key) ?? { frames: [], moving: [], boxes };
      if (h.frames[h.frames.length - 1] !== s.frame) {
        h.frames.push(s.frame);
        h.moving.push(isMoving);
      }
      hits.set(key, h);
    };
    const texts = s.els.flatMap((e, order) => e.texts.filter((t) => t.opacity >= 0.3).map((t) => ({ el: e.id, order, t })));
    for (let i = 0; i < texts.length; i++) {
      const a = texts[i];
      const comp = componentOf.get(a.el) ?? "";
      const inner = inflate(a.t.box, -1); // ink boxes are ±1 px
      for (let j = i + 1; j < texts.length; j++) {
        const b = texts[j];
        if (!boxesMeet(inner, inflate(b.t.box, -1))) continue;
        if (a.el === b.el && allowedOwnText(comp, a.t, b.t)) continue;
        note(`text|${a.el} "${a.t.text}"|${b.el === a.el ? "its own" : b.el} "${b.t.text}"`, false, [a.t.box, b.t.box]);
      }
      for (const el of s.els) {
        const own = el.id === a.el;
        if (own && allowedOwnLine(comp, a.t)) continue;
        const l = el.lines.find((l) => l[5] >= 0.3 && segmentHitsBox(l[0], l[1], l[2], l[3], inflate(inner, l[4] / 2)));
        if (l) note(`line|${a.el} "${a.t.text}"|${own ? "its own" : el.id}`, moving(el.id), [a.t.box, lineBox(l)]);
      }
      // Translucent fills drawn over the text (later in the draw order) hide it too.
      for (const [order, el] of s.els.entries()) {
        if (order <= a.order || el.id === "captions") continue;
        const f = el.fills.find((f) => f[4] >= 0.05 && fillMeetsBox(f, inner));
        if (f) note(`fill|${a.el} "${a.t.text}"|${el.id}`, moving(el.id), [a.t.box, [f[0], f[1], f[2], f[3]]]);
      }
    }
    prev = shape;
  }
  const spatial = [...hits.entries()].map(([key, h]) => {
    const [kind, text, other] = key.split("|");
    const allMoving = kind !== "text" && h.moving.every(Boolean);
    const whose = other === "its own" ? "its own" : `${other}'s`;
    return {
      status: (allMoving ? "warn" : "fail") as Status,
      what:
        kind === "text"
          ? `${text} overlaps ${other}`
          : `${whose} ${kind === "line" ? "lines cross" : "fill covers"} ${text}${allMoving ? " (while moving)" : ""}`,
      frames: h.frames,
      boxes: h.boxes,
    };
  });
  // Temporal: old content still visible while new content draws.
  const exits = timeline.elements.flatMap((e) => e.actions.filter((a) => a.action === "exit").map((a) => ({ id: e.id, ...a })));
  const entrances = timeline.elements.flatMap((e) =>
    e.actions.filter((a) => a.action === "appear" || a.action === "reveal").map((a) => ({ id: e.id, ...a })),
  );
  const crossed = new Map<string, { frames: number[]; entering: Set<string> }>(); // by exiting element
  for (const s of snaps) {
    const f = s.frame;
    const gone = exits.filter((a) => a.from <= f && f < a.to && visibleOpacity(s, a.id) >= 0.05);
    const inn = entrances.filter((a) => a.from <= f && f < a.to && visibleOpacity(s, a.id) >= 0.05 && !gone.some((o) => o.id === a.id));
    if (!inn.length) continue;
    for (const o of gone) {
      const c = crossed.get(o.id) ?? { frames: [], entering: new Set<string>() };
      if (c.frames[c.frames.length - 1] !== f) c.frames.push(f);
      for (const a of inn) c.entering.add(a.id);
      crossed.set(o.id, c);
    }
  }
  const temporal = [...crossed.entries()].map(([id, c]) => {
    const mid = c.frames[Math.floor(c.frames.length / 2)];
    const snap = snaps[mid];
    const boxes = [id, ...c.entering].map((e) => elementBox(snap.els.find((x) => x.id === e))).filter((b): b is Box => !!b);
    return {
      status: "fail" as Status,
      what: `${[...c.entering].join(", ")} draw${c.entering.size > 1 ? "" : "s"} while ${id} is still fading out`,
      frames: c.frames,
      boxes,
    };
  });
  const findings = [...spatial, ...temporal].sort((a, b) => Number(b.status === "fail") - Number(a.status === "fail"));
  add({
    id: "overlaps",
    status: findings.length ? worst(findings.map((f) => f.status)) : "pass",
    summary: findings.length
      ? findings.map((f) => `${ranges(f.frames)}: ${f.what}`).join("; ")
      : "no text meets other text, lines, or a fill drawn over it (in or across elements); no entrance draws while an exit is still visible",
    details: findings.map(({ boxes, ...f }) => f),
    cites: findings.map((f) => ({ frame: f.frames[Math.floor(f.frames.length / 2)], boxes: f.boxes, note: `overlaps: ${ranges(f.frames)}: ${f.what}` })),
  });
}

// ---- Label ownership: an edge label clearly nearer its own edge than any other line ----------
{
  type Own = { id: string; text: string; frame: number; own: number; other: number; otherId: string; box: Box; otherBox: Box };
  const worstOf = new Map<string, Own>();
  const prevBox = new Map<string, string>();
  let prevShape = new Map<string, string>();
  for (const s of snaps) {
    const shape = new Map(s.els.map((e) => [e.id, JSON.stringify(e.lines.map((l) => l.slice(0, 4)))]));
    const before = prevShape;
    const still = (id: string) => shape.get(id) === before.get(id);
    prevShape = shape;
    for (const el of s.els) {
      for (const t of el.texts) {
        if (t.kind !== "edge-label") continue;
        const key = `${el.id}|${t.text}`;
        const rested = prevBox.get(key) === JSON.stringify(t.box);
        prevBox.set(key, JSON.stringify(t.box));
        // Judge resting layouts; passing moments are the overlap check's.
        if (t.opacity < 0.9 || !rested || !still(el.id)) continue;
        const ownLines = el.lines.filter((l) => l[5] >= 0.3);
        if (!ownLines.length) continue;
        const own = Math.min(...ownLines.map((l) => boxToLine(t.box, l)));
        let other = Infinity;
        let otherId = "";
        let otherBox: Box = t.box;
        for (const e of s.els) {
          if (e.id === el.id || !still(e.id)) continue;
          for (const l of e.lines) {
            if (l[5] < 0.3 || ownLines.some((o) => collinear(o, l))) continue;
            const d = boxToLine(t.box, l);
            if (d < other) [other, otherId, otherBox] = [d, e.id, lineBox(l)];
          }
        }
        if (!Number.isFinite(other)) continue;
        const cur = worstOf.get(key);
        if (!cur || other / Math.max(own, 1) < cur.other / Math.max(cur.own, 1))
          worstOf.set(key, { id: el.id, text: t.text, frame: s.frame, own, other, otherId, box: t.box, otherBox });
      }
    }
  }
  const rows = [...worstOf.values()].map((o) => ({ ...o, ratio: o.other / Math.max(o.own, 1) })).sort((a, b) => a.ratio - b.ratio);
  const bad = rows.filter((r) => r.ratio < checks.labelOwnership);
  const fmt = (r: (typeof rows)[number]) => `${r.id} "${r.text}" ${r.own.toFixed(0)} px from its edge, ${r.other.toFixed(0)} px from ${r.otherId}'s`;
  add({
    id: "labels",
    status: bad.length ? "fail" : rows.length ? "pass" : "skip",
    summary: bad.length
      ? `${bad.length} edge labels sit too near another element (need ${checks.labelOwnership}× their own gap): ${bad.map(fmt).join("; ")}`
      : rows.length
        ? `every resting edge label sits at least ${checks.labelOwnership}× nearer its own edge than any other line; closest: ${fmt(rows[0])}`
        : "no edge label has another element's line nearby",
    details: rows.map(({ box, otherBox, ...r }) => ({ ...r, own: +r.own.toFixed(1), other: +r.other.toFixed(1), ratio: +r.ratio.toFixed(2) })),
    cites: bad.map((r) => ({ frame: r.frame, boxes: [r.box, r.otherBox], note: `labels: ${fmt(r)}` })),
  });
}

// ---- Captions: on time, one line, inside the zone ------------------------------------------------
{
  const rows = timeline.captions.map((c) => {
    // The first frame the caption band changes around the caption's cue frame.
    let shown: number | null = null;
    for (let f = Math.max(1, c.from - 3); f <= Math.min(px.frames - 1, c.from + 12); f++) {
      if (px.captionChange[f] > checks.changePixels) {
        shown = f;
        break;
      }
    }
    const mid = Math.min(c.to - 1, c.from + 6);
    const item = snaps[mid].els.find((e) => e.id === "captions")?.texts[0];
    const inside = !item || (item.box[0] >= content.left && item.box[2] <= content.right && item.box[1] >= zone.caption.top && item.box[3] <= zone.caption.bottom);
    const late = shown === null ? null : shown - c.from;
    const problems = [
      late === null ? "never appears" : late > checks.captionLateFrames ? `${late} frames late` : "",
      item && (item.lines ?? 1) > 1 ? `${item.lines} lines` : "",
      inside ? "" : "outside the caption zone",
    ].filter(Boolean);
    return { text: c.text, from: c.from, shown, late, lines: item?.lines ?? null, inside, problems, box: item?.box };
  });
  const bad = rows.filter((r) => r.problems.length);
  const lates = rows.map((r) => r.late).filter((l): l is number => l !== null);
  add({
    id: "captions",
    status: bad.length ? "fail" : "pass",
    summary: bad.length
      ? `${bad.length} of ${rows.length} captions: ${bad.slice(0, 5).map((r) => `"${r.text}" (f${r.from}) ${r.problems.join(", ")}`).join("; ")}`
      : `all ${rows.length} captions appear ${Math.min(...lates)}–${Math.max(...lates)} frames after their cue (limit ${checks.captionLateFrames}), on one line, inside the caption zone`,
    details: rows.map(({ box, ...r }) => r),
    cites: bad.map((r) =>
      r.late !== null && r.late > checks.captionLateFrames
        ? {
            frame: r.from,
            pair: [r.from, r.shown!] as [number, number],
            pairLabels: ["cued", "shown"] as [string, string],
            note: `captions: "${r.text}" is cued at f${r.from} but shows at f${r.shown}`,
          }
        : { frame: Math.min(r.from + 6, px.frames - 1), boxes: r.box ? [r.box] : [], note: `captions: "${r.text}" ${r.problems.join(", ")}` },
    ),
  });
}

// ---- Readable: names and labels on screen long enough to read ------------------------------------
{
  const byGroup = new Map<string, Set<string>>(); // element|kind -> texts (many = a live value)
  const runs = new Map<string, { id: string; kind: string; text: string; best: number[]; cur: number[]; boxes: Map<number, Box> }>();
  for (const s of snaps) {
    const seen = new Set<string>();
    for (const el of s.els) {
      for (const t of el.texts) {
        if (!["name", "label", "edge-label"].includes(t.kind)) continue;
        const group = `${el.id}|${t.kind}`;
        byGroup.set(group, (byGroup.get(group) ?? new Set()).add(t.text));
        const key = `${group}|${t.text}`;
        const r = runs.get(key) ?? { id: el.id, kind: t.kind, text: t.text, best: [], cur: [], boxes: new Map() };
        runs.set(key, r);
        if (t.opacity < 0.9) continue;
        seen.add(key);
        r.cur.push(s.frame);
        r.boxes.set(s.frame, t.box);
        if (r.cur.length > r.best.length) r.best = [...r.cur];
      }
    }
    for (const [key, r] of runs) if (!seen.has(key)) r.cur = [];
  }
  const short = [...runs.values()]
    .filter((r) => (byGroup.get(`${r.id}|${r.kind}`)?.size ?? 0) <= 5 && r.best.length < checks.readableFrames)
    .sort((a, b) => a.best.length - b.best.length);
  add({
    id: "readable",
    status: short.length ? "warn" : "pass",
    summary: short.length
      ? `${short.length} names or labels are fully visible for under ${checks.readableFrames} frames: ` +
        short.map((r) => `${r.id} "${r.text}" ${r.best.length ? `${r.best.length} frames (${ranges(r.best)})` : "never fully"}`).join("; ")
      : `every name and label stays fully visible at least ${checks.readableFrames} frames`,
    details: short.map(({ cur, boxes, ...r }) => ({ ...r, best: r.best.length })),
    cites: short
      .filter((r) => r.best.length)
      .map((r) => {
        const f = r.best[Math.floor(r.best.length / 2)];
        return { frame: f, boxes: [r.boxes.get(f)!], note: `readable: ${r.id} "${r.text}" fully visible only ${r.best.length} frames (${ranges(r.best)})` };
      }),
  });
}

// ---- Reaction: each beat's first word to the first visible change --------------------------------
{
  const rows = beatFirstWord.map((b) => {
    if (!b.hasCue) return { ...b, latency: null as number | null, status: "skip" as Status };
    const latency = px.reaction.get(b.frame) ?? null;
    return { ...b, latency, status: (latency !== null && latency <= checks.reactionFrames ? "pass" : "fail") as Status };
  });
  add({
    id: "reaction",
    status: worst(rows.map((r) => r.status).filter((s) => s !== "skip")),
    summary:
      rows.map((r) => `${r.beat} ${r.status === "skip" ? "—" : r.latency === null ? "none" : `+${r.latency}`}`).join(", ") +
      ` (frames from each beat's first word to the first visible change; — = no cue on that word; limit ${checks.reactionFrames})`,
    details: rows,
    cites: rows
      .filter((r) => r.status === "fail")
      .map((r) => ({
        frame: r.frame,
        pair: [r.frame - 1, r.frame + checks.reactionFrames] as [number, number],
        note: `reaction: ${r.beat}'s first word is at f${r.frame}; f${r.frame - 1} and f${r.frame + checks.reactionFrames} look the same`,
      })),
  });
}

// ---- Cues later in a beat (warn): the same, for every other cue ------------------------------------
{
  const firsts = new Set(beatFirstWord.map((b) => b.frame));
  const slow = [...new Map(cueFrames.filter((c) => !firsts.has(c.frame)).map((c) => [c.frame, c])).values()]
    .map((c) => ({ ...c, latency: px.reaction.get(c.frame) ?? null }))
    .filter((c) => c.latency === null || c.latency > checks.cueFrames);
  add({
    id: "cues",
    status: slow.length ? "warn" : "pass",
    summary: slow.length
      ? `${slow.length} cues show nothing within ${checks.cueFrames} frames of their word: ` +
        slow.map((c) => `${c.beat} f${c.frame} ${c.what} ${c.latency === null ? "none" : `+${c.latency}`}`).join("; ")
      : `every cue after a beat's first word shows a change within ${checks.cueFrames} frames`,
    details: slow,
    cites: slow.map((c) => ({ frame: c.frame, pair: [c.frame - 1, c.frame + checks.cueFrames] as [number, number], note: `cues: ${c.beat} ${c.what} at f${c.frame}` })),
  });
}

// ---- Blank frames between beats (warn) --------------------------------------------------------------
{
  const blank = runsOf(px.visual.flatMap((b, f) => (b === null ? [f] : []))).filter((r) => r.length > checks.blankFrames);
  add({
    id: "blank",
    status: blank.length ? "warn" : "pass",
    summary: blank.length
      ? `the visual zone is empty for ${blank.map((r) => `${r.length} frames (${ranges(r)})`).join(", ")} (more than ${checks.blankFrames} in a row reads as a cut)`
      : `the visual zone is never empty for more than ${checks.blankFrames} frames in a row`,
    cites: blank.map((r) => ({ frame: r[0], pair: [r[0] - 1, r[r.length - 1]] as [number, number], note: `blank: empty visual zone ${ranges(r)}` })),
  });
}

// ---- Audio --------------------------------------------------------------------------------------------
{
  const { lufs, lra, truePeak } = loudness(render);
  const { target, tolerance, maxTruePeak } = checks.loudness;
  add({
    id: "loudness",
    status: Math.abs(lufs - target) <= tolerance && truePeak <= maxTruePeak ? "pass" : "fail",
    summary: `${lufs} LUFS integrated (target ${target} ±${tolerance}), true peak ${truePeak} dBTP (max ${maxTruePeak}), range ${lra} LU`,
  });

  const lag = renderPcm ? envelopeLag(pcm(join(episode, "narration.mp3")), renderPcm) : NaN;
  add({
    id: "av-sync",
    status: Math.abs(lag) <= checks.avOffsetMs ? "pass" : "fail",
    summary: `render audio is ${lag} ms ${lag > 0 ? "late" : lag < 0 ? "early" : "off"} against narration.mp3 (limit ±${checks.avOffsetMs} ms)`,
  });

  // words.json against the audio. Audible onsets (speech right after a dip,
  // from the render's own levels) don't depend on the aligner: every word
  // words.json puts after a gap should start at one. (Stop closures inside
  // words make onsets too, so onsets without a word prove nothing.)
  const spoken = storyboard.beats.flatMap((b: { readAloud: string }) => b.readAloud.split(/\s+/));
  const sameWords = spoken.length === words.length && spoken.every((w: string, i: number) => w === words[i].word);
  const lv = renderPcm ? levels(renderPcm) : new Float64Array();
  const onsets: number[] = []; // ms
  for (let k = 6; k < lv.length; k++) {
    if (lv[k] < checks.onset.speechDb || lv[k - 1] >= checks.onset.speechDb) continue;
    if (Math.min(...lv.slice(k - 6, k)) > checks.onset.dipDb) continue;
    if (onsets.length && k * 10 - onsets[onsets.length - 1] < 100) continue;
    onsets.push(k * 10);
  }
  const reach = 400; // ms to look for an onset
  const afterGap = words.filter((w, i) => i === 0 || w.start - words[i - 1].end >= checks.onset.wordGap);
  const devs = afterGap.map((w) => {
    const at = w.start * 1000;
    const near = onsets.reduce((a, o) => (Math.abs(o - at) < Math.abs(a - at) ? o : a), Infinity);
    return { word: w.word, start: w.start, dev: Math.abs(near - at) <= reach ? Math.round(near - at) : null };
  });
  const found = devs.filter((d): d is { word: string; start: number; dev: number } => d.dev !== null);
  const worstDev = found.reduce((a, b) => (Math.abs(b.dev) > Math.abs(a?.dev ?? 0) ? b : a), found[0]);
  const bad = devs.filter((d) => d.dev === null || Math.abs(d.dev) > checks.wordOnsetMs);
  add({
    id: "words",
    status: !sameWords || bad.length ? "fail" : "pass",
    summary: !sameWords
      ? "words.json's words differ from the storyboard's readAloud: rebuild from the aligned take"
      : `${found.length} of ${afterGap.length} words after a pause start within ${worstDev ? Math.abs(worstDev.dev) : 0} ms of an audible onset` +
        (worstDev ? ` (widest "${worstDev.word}" at ${worstDev.start} s, ${worstDev.dev > 0 ? "+" : ""}${worstDev.dev} ms)` : "") +
        `; limit ±${checks.wordOnsetMs} ms` +
        (bad.length ? `; off: ${bad.slice(0, 5).map((d) => `"${d.word}" ${d.dev === null ? "no onset" : `${d.dev} ms`}`).join(", ")}` : ""),
    details: devs,
  });
}

// ---- Loop -----------------------------------------------------------------------------------------------
add(
  !loopPromised
    ? { id: "loop", status: "skip", summary: 'the storyboard promises no loop (no "loop": true)' }
    : {
        id: "loop",
        status: (px.loopPixels ?? Infinity) <= checks.loopMaxPixels ? "pass" : "fail",
        summary: `${px.loopPixels} visual-zone pixels differ by more than ${checks.changeLevel} levels between the last and first frame (limit ${checks.loopMaxPixels})`,
        cites:
          (px.loopPixels ?? 0) > checks.loopMaxPixels
            ? [{ frame: px.frames - 1, pair: [px.frames - 1, 0] as [number, number], pairLabels: ["last", "first"] as [string, string], note: "loop: last frame against the first" }]
            : [],
      },
);

// ---- Evidence and report -----------------------------------------------------------------------------------
const evidence = join(out, "check");
mkdirSync(evidence, { recursive: true });
for (const f of readdirSync(evidence)) if (f.endsWith(".png")) rmSync(join(evidence, f));
const pad4 = (f: number) => String(f).padStart(4, "0");
const inVideo = (f: number) => Math.max(0, Math.min(px.frames - 1, f));
const cited = results
  .filter((r) => r.status === "fail" || r.status === "warn")
  .flatMap((r) =>
    (r.cites ?? []).slice(0, 3).map((c, i) => ({
      ...c,
      frame: inVideo(c.frame),
      pair: c.pair?.map(inVideo) as [number, number] | undefined,
      check: r.id,
      file: c.pair ? `${r.id}-${i + 1}.png` : `f${pad4(inVideo(c.frame))}.png`,
    })),
  );
for (const r of results) r.cites = cited.filter((c) => c.check === r.id);
const ends: { beat: string; frame: number }[] = cues.beats.map((b: { id: string; endFrame: number }) => ({ beat: b.id, frame: b.endFrame }));
const needed = [...new Set([...ends.map((e) => e.frame), ...(loopPromised ? [0] : []), ...cited.flatMap((c) => c.pair ?? [c.frame])])].sort((a, b) => a - b);
const tmp = mkdtempSync(join(tmpdir(), "check-render-"));
try {
  execFileSync("ffmpeg", ["-v", "error", "-i", render, "-vf", `select='${needed.map((f) => `eq(n\\,${f})`).join("+")}'`, "-fps_mode", "vfr", join(tmp, "x%04d.png")]);
  needed.forEach((f, i) => renameSync(join(tmp, `x${pad4(i + 1)}.png`), join(tmp, `f${pad4(f)}.png`)));
  const crop = [0, zone.visual.top - 30, VIDEO.width, zone.caption.bottom + 30];
  const byFrame = new Map<string, { frame: number; boxes: Box[]; notes: string[] }>();
  for (const c of cited.filter((c) => !c.pair)) {
    const e = byFrame.get(c.file) ?? { frame: c.frame, boxes: [], notes: [] };
    e.boxes.push(...(c.boxes ?? []));
    e.notes.push(c.note);
    byFrame.set(c.file, e);
  }
  const spec = {
    frames: tmp,
    out: evidence,
    font: join(import.meta.dirname, "../node_modules/pretendard/dist/public/static/Pretendard-SemiBold.otf"),
    outputs: [
      {
        file: "sheet.png",
        kind: "sheet",
        crop,
        width: 270,
        cols: 5,
        tiles: [...(loopPromised ? [{ frame: 0, label: "f0 · loop start" }] : []), ...ends.map((e) => ({ frame: e.frame, label: `${e.beat} end · f${e.frame}` }))],
      },
      ...[...byFrame.entries()].map(([file, e]) => ({ file, kind: "frame", frame: e.frame, boxes: e.boxes, notes: e.notes })),
      ...cited
        .filter((c) => c.pair)
        .map((c) => ({
          file: c.file,
          kind: "pair",
          crop,
          width: 480,
          tiles: c.pair!.map((f, i) => ({ frame: f, label: `${(c.pairLabels ?? ["before", "after"])[i]} · f${f}`, boxes: [] })),
        })),
    ],
  };
  writeFileSync(join(tmp, "spec.json"), JSON.stringify(spec));
  execFileSync("uv", ["run", "--quiet", join(import.meta.dirname, "check", "evidence.py"), join(tmp, "spec.json")], { stdio: ["ignore", "ignore", "inherit"] });
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

const counts = { fail: 0, warn: 0, pass: 0, skip: 0 };
for (const r of results) counts[r.status]++;
const verdict = counts.fail ? "fail" : "pass";
mkdirSync(out, { recursive: true });
writeFileSync(
  join(out, "check.json"),
  JSON.stringify(
    {
      episode: slug,
      render: "render.mp4",
      storyboardSha256,
      studioSha256: studioHash,
      verdict,
      counts,
      contactSheet: "check/sheet.png",
      checks: results.map((r) => ({ ...r, cites: r.cites?.map(({ boxes, check, ...c }: Cite & { check?: string }) => c) })),
    },
    null,
    1,
  ) + "\n",
);
const md = [
  `# Render check · ${slug}`,
  "",
  `**${verdict === "fail" ? "Fail" : "Pass"}**: ${counts.fail} fail, ${counts.warn} warn, ${counts.pass} pass, ${counts.skip} skip · contact sheet \`check/sheet.png\``,
  "",
  "| Check | Status | Summary |",
  "|---|---|---|",
  ...results.map((r) => `| ${r.id} | ${r.status} | ${r.summary.replace(/\|/g, "\\|")} |`),
  "",
  ...results
    .filter((r) => r.cites?.length)
    .flatMap((r) => [`**${r.id}** (${r.status})`, "", ...r.cites!.map((c) => `- \`check/${(c as Cite & { file: string }).file}\`: ${c.note}`), ""]),
].join("\n");
writeFileSync(join(out, "check.md"), md);
console.log(md);
console.log(`(checked in ${Math.round((Date.now() - started) / 100) / 10} s)`);
process.exitCode = verdict === "fail" ? 1 : 0;
