// Checks an episode's render.mp4 against its storyboard and the delivery
// rules: technical, bounds, centering, legibility, overlaps, reaction, audio,
// loop. Thresholds come from `checks` (and content, zone, VIDEO) in
// src/style/theme.ts. Pixels come from the render; exact element geometry
// from the player itself, run in the browser without screenshots
// (scripts/probe.mts).
//
//   node scripts/check-render.mts ../episodes/<slug>
// Writes <episode>/check.json, <episode>/check.md, and under <episode>/check/
// a contact sheet of the beat ends plus the frames a failing or warning check
// cites (offending regions boxed in red). Exits 1 if any check fails.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { checks, content, VIDEO, zone } from "../src/style/theme.ts";
import { type Box, envelopeLag, ffprobe, levels, loudness, pcm, pixelPass } from "./check/media.mts";
import { bundleStudio, type FrameSnap, probeFrames } from "./probe.mts";

type Status = "pass" | "warn" | "fail" | "skip";
type Cite = { frame: number; box?: Box; note: string };
type Result = { id: string; status: Status; summary: string; details?: unknown; cites?: Cite[] };
type Timeline = {
  elements: { id: string; component: string; start: number; end: number | null; actions: { action: string; from: number; to: number }[] }[];
};

const arg = process.argv[2];
if (!arg) throw new Error("usage: node scripts/check-render.mts <episode dir>");
const started = Date.now();
const episode = resolve(arg);
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
const fps = VIDEO.fps;

const results: Result[] = [];
const add = (r: Result) => results.push(r);
const worst = (s: Status[]): Status => (s.includes("fail") ? "fail" : s.includes("warn") ? "warn" : s.length ? "pass" : "skip");
const ranges = (frames: number[]) => {
  const out: string[] = [];
  for (let i = 0; i < frames.length; ) {
    let j = i;
    while (j + 1 < frames.length && frames[j + 1] === frames[j] + 1) j++;
    out.push(i === j ? `f${frames[i]}` : `f${frames[i]}–${frames[j]}`);
    i = j + 1;
  }
  return out.join(", ");
};
const r0 = (n: number) => Math.round(n);

// ---- Freshness: the render and cues come from this storyboard.json ---------
{
  const tag = /storyboard-sha256=([0-9a-f]{64})/.exec(ffprobe(render).format.tags?.comment ?? "")?.[1];
  const cuesOk = cues.storyboardSha256 === storyboardSha256;
  const status: Status = !cuesOk || (tag && tag !== storyboardSha256) ? "fail" : tag ? "pass" : "warn";
  add({
    id: "freshness",
    status,
    summary: !cuesOk
      ? "cues.json was built from another storyboard.json: rerun build-cues.py and render.mts"
      : !tag
        ? "render.mp4 carries no storyboard hash (made before render.mts tagged renders); can't prove it matches"
        : tag === storyboardSha256
          ? "render.mp4 and cues.json were both built from this storyboard.json"
          : "render.mp4 was rendered from another storyboard.json: rerun render.mts",
  });
}

// ---- Technical --------------------------------------------------------------
const info = ffprobe(render);
const video = info.streams.find((s) => s.codec_type === "video");
const audio = info.streams.find((s) => s.codec_type === "audio");
const renderPcm = audio ? pcm(render) : null;
{
  const problems: string[] = [];
  const [num, den] = (video?.r_frame_rate ?? "0/1").split("/").map(Number);
  const vDur = Number(video?.duration ?? info.format.duration);
  if (!video) problems.push("no video stream");
  else {
    if (video.width !== VIDEO.width || video.height !== VIDEO.height) problems.push(`${video.width}×${video.height}, not ${VIDEO.width}×${VIDEO.height}`);
    if (num / den !== fps) problems.push(`${num / den} fps, not ${fps}`);
    if (Number(video.nb_frames) !== cues.durationInFrames) problems.push(`${video.nb_frames} frames, cues.json says ${cues.durationInFrames}`);
    if (vDur > checks.maxSeconds) problems.push(`${vDur.toFixed(2)} s, over ${checks.maxSeconds} s`);
  }
  let tail = "";
  if (!audio || !renderPcm) problems.push("no audio stream");
  else {
    const aDur = Number(audio.duration);
    if (aDur < vDur - 1 / fps) problems.push(`audio ends at ${aDur.toFixed(2)} s, video at ${vDur.toFixed(2)} s`);
    const lv = levels(renderPcm);
    const tailDb = Math.max(...lv.slice(-10));
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
      : `${video!.width}×${video!.height}, ${fps} fps, ${video!.nb_frames} frames (${vDur.toFixed(2)} s), video + audio${tail}`,
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
const lastBeat = storyboard.beats[storyboard.beats.length - 1];
const loopPromised = storyboard.loop === true || /first frame/i.test(lastBeat.endFrame ?? "");

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
    wordFrames: beatFirstWord.filter((b) => b.hasCue).map((b) => b.frame),
    reactionWindow: checks.reactionFrames + 12,
    loop: loopPromised,
  }),
]);
const timeline = snaps[0].extra as Timeline;

// Geometry helpers over probe snapshots.
const inflate = ([l, t, r, b]: Box, d: number): Box => [l - d, t - d, r + d, b + d];
const boxesMeet = (a: Box, b: Box) => Math.min(a[2], b[2]) - Math.max(a[0], b[0]) > 0 && Math.min(a[3], b[3]) - Math.max(a[1], b[1]) > 0;
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
const visibleOpacity = (snap: FrameSnap, id: string) => {
  const el = snap.els.find((e) => e.id === id);
  if (!el) return 0;
  return Math.max(0, ...el.lines.map((l) => l[5]), ...el.fills.map((f) => f[4]), ...el.texts.map((t) => t.opacity));
};

// ---- Bounds -------------------------------------------------------------------
{
  const cites: Cite[] = [...px.outside]
    .sort((a, b) => b.pixels - a.pixels)
    .slice(0, 3)
    .map((o) => ({ frame: o.frame, box: o.box, note: `${o.pixels} ink px outside, x ${o.box[0]}–${o.box[2] - 1}, y ${o.box[1]}–${o.box[3] - 1}` }));
  // Visual elements reaching into the caption band (pixels can't tell them from captions).
  const intrusions: { frame: number; id: string; bottom: number }[] = [];
  for (const s of snaps) {
    for (const el of s.els) {
      if (el.id === "captions") continue;
      const bottoms = [
        ...el.lines.filter((l) => l[5] >= 0.1).map((l) => Math.max(l[1], l[3]) + l[4] / 2),
        ...el.texts.filter((t) => t.opacity >= 0.1).map((t) => t.box[3]),
        ...el.fills.filter((f) => f[4] >= 0.1).map((f) => f[3]),
      ];
      const bottom = Math.max(-Infinity, ...bottoms);
      if (bottom > zone.caption.top) intrusions.push({ frame: s.frame, id: el.id, bottom });
    }
  }
  for (const i of intrusions.slice(0, 3)) cites.push({ frame: i.frame, note: `${i.id} reaches y ${r0(i.bottom)}, into the caption band` });
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
    cites,
  });
}

// ---- Centering at beat ends -----------------------------------------------------
{
  const rows: { beat: string; frame: number; center: number | null; off: number | null; status: Status; why?: string }[] = [];
  const cites: Cite[] = [];
  cues.beats.forEach((b: { id: string; endFrame: number }) => {
    const box = px.visual[b.endFrame];
    if (!box) return rows.push({ beat: b.id, frame: b.endFrame, center: null, off: null, status: "skip" });
    const center = (box[0] + box[2]) / 2;
    const off = center - content.centerX;
    if (Math.abs(off) <= checks.centerTolerance) return rows.push({ beat: b.id, frame: b.endFrame, center, off, status: "pass" });
    // Is it a label hanging off one side of a centered picture?
    const snap = snaps[b.endFrame];
    const parts: Box[] = [];
    const labels: string[] = [];
    for (const el of snap.els) {
      if (el.id === "captions") continue;
      for (const l of el.lines) if (l[5] >= 0.1) parts.push([Math.min(l[0], l[2]), Math.min(l[1], l[3]), Math.max(l[0], l[2]), Math.max(l[1], l[3])]);
      for (const f of el.fills) if (f[4] >= 0.1) parts.push([f[0], f[1], f[2], f[3]]);
      for (const t of el.texts) {
        if (t.opacity < 0.1) continue;
        if (t.kind === "edge-label") labels.push(`"${t.text}"`);
        else parts.push(t.box);
      }
    }
    const without = parts.length ? (Math.min(...parts.map((p) => p[0])) + Math.max(...parts.map((p) => p[2]))) / 2 : center;
    const explained = labels.length > 0 && Math.abs(without - content.centerX) <= checks.centerTolerance;
    const why = explained ? `picture centers at ${r0(without)}; edge labels ${labels.join(", ")} pull it off` : undefined;
    rows.push({ beat: b.id, frame: b.endFrame, center, off, status: explained ? "warn" : "fail", why });
    cites.push({ frame: b.endFrame, box, note: `${b.id} ink center ${r0(center)} (${off > 0 ? "+" : ""}${r0(off)} px)${why ? `: ${why}` : ""}` });
    cites.sort((a, b2) => Math.abs(Number(/\(([+-]?\d+) px/.exec(b2.note)?.[1])) - Math.abs(Number(/\(([+-]?\d+) px/.exec(a.note)?.[1])));
  });
  const status = worst(rows.map((r) => r.status).filter((s) => s !== "skip"));
  add({
    id: "centering",
    status,
    summary: rows
      .map((r) => `${r.beat} ${r.off === null ? "—" : `${r.off > 0 ? "+" : ""}${r0(r.off)}`}`)
      .join(", ") + ` (px off x ${content.centerX}, tolerance ±${checks.centerTolerance})`,
    details: rows,
    cites,
  });
}

// ---- Legibility -------------------------------------------------------------------
{
  const smallest = new Map<string, { id: string; kind: string; text: string; char: string; height: number; frame: number }>();
  for (const s of snaps) {
    for (const el of s.els) {
      for (const t of el.texts) {
        if (t.opacity < 0.5 || !t.glyph) continue;
        const key = `${el.id}|${t.kind}|${t.text}`;
        const cur = smallest.get(key);
        if (!cur || t.glyph[1] < cur.height) smallest.set(key, { id: el.id, kind: t.kind, text: t.text, char: t.glyph[0], height: t.glyph[1], frame: s.frame });
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
    details: all.slice(0, 20),
    cites: small.slice(0, 3).map((g) => {
      const t = snaps[g.frame].els.find((e) => e.id === g.id)!.texts.find((x) => x.text === g.text)!;
      return { frame: g.frame, box: t.box, note: `${g.id} "${g.text}": "${g.char}" is ${g.height} px` };
    }),
  });
}

// ---- Overlaps -----------------------------------------------------------------------
{
  // Spatial: text against other elements' text and lines, frame by frame.
  type Hit = { frames: number[]; moving: boolean[]; box: Box };
  const hits = new Map<string, Hit>();
  let prevLines = new Map<string, string>();
  for (const s of snaps) {
    const lines = new Map(s.els.map((e) => [e.id, JSON.stringify(e.lines.map((l) => l.slice(0, 4)))]));
    const texts = s.els.flatMap((e) => e.texts.filter((t) => t.opacity >= 0.3).map((t) => ({ el: e.id, t })));
    const note = (key: string, moving: boolean, box: Box) => {
      const h = hits.get(key) ?? { frames: [], moving: [], box };
      if (h.frames[h.frames.length - 1] !== s.frame) {
        h.frames.push(s.frame);
        h.moving.push(moving);
      }
      hits.set(key, h);
    };
    for (let i = 0; i < texts.length; i++) {
      const a = texts[i];
      const inner = inflate(a.t.box, -1); // ink boxes are ±1 px
      for (let j = i + 1; j < texts.length; j++) {
        const b = texts[j];
        if (a.el !== b.el && boxesMeet(inner, inflate(b.t.box, -1))) note(`text|${a.el} "${a.t.text}"|${b.el} "${b.t.text}"`, false, a.t.box);
      }
      for (const el of s.els) {
        if (el.id === a.el) continue;
        for (const l of el.lines) {
          if (l[5] < 0.3 || !segmentHitsBox(l[0], l[1], l[2], l[3], inflate(inner, l[4] / 2))) continue;
          note(`line|${a.el} "${a.t.text}"|${el.id}`, lines.get(el.id) !== prevLines.get(el.id), a.t.box);
          break;
        }
      }
    }
    prevLines = lines;
  }
  const spatial = [...hits.entries()].map(([key, h]) => {
    const [kind, text, other] = key.split("|");
    const allMoving = kind === "line" && h.moving.every(Boolean);
    return {
      status: (allMoving ? "warn" : "fail") as Status,
      what: kind === "text" ? `${text} overlaps ${other}` : `${other}'s lines cross ${text}${allMoving ? " (while moving)" : ""}`,
      frames: h.frames,
      box: h.box,
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
    const out = exits.filter((a) => a.from <= f && f < a.to && visibleOpacity(s, a.id) >= 0.05);
    const inn = entrances.filter((a) => a.from <= f && f < a.to && visibleOpacity(s, a.id) >= 0.05 && !out.some((o) => o.id === a.id));
    if (!inn.length) continue;
    for (const o of out) {
      const c = crossed.get(o.id) ?? { frames: [], entering: new Set<string>() };
      if (c.frames[c.frames.length - 1] !== f) c.frames.push(f);
      for (const a of inn) c.entering.add(a.id);
      crossed.set(o.id, c);
    }
  }
  const findings = [
    ...spatial,
    ...[...crossed.entries()].map(([id, c]) => ({
      status: "fail" as Status,
      what: `${[...c.entering].join(", ")} draw${c.entering.size > 1 ? "" : "s"} while ${id} is still fading out`,
      frames: c.frames,
      box: undefined,
    })),
  ];
  add({
    id: "overlaps",
    status: worst(findings.map((f) => f.status)) === "skip" ? "pass" : worst(findings.map((f) => f.status)),
    summary: findings.length
      ? findings.map((f) => `${ranges(f.frames)}: ${f.what}`).join("; ")
      : "no text meets another element's text or lines; no entrance draws while an exit is still visible",
    details: findings,
    cites: [...findings]
      .sort((a, b) => Number(b.status === "fail") - Number(a.status === "fail"))
      .map((f) => ({ frame: f.frames[Math.floor(f.frames.length / 2)], box: f.box, note: `${ranges(f.frames)}: ${f.what}` })),
  });
}

// ---- Reaction -----------------------------------------------------------------------
{
  const rows = beatFirstWord.map((b) => {
    if (!b.hasCue) return { ...b, latency: null as number | null, status: "skip" as Status };
    const latency = px.reaction.get(b.frame) ?? null;
    return { ...b, latency, status: (latency !== null && latency <= checks.reactionFrames ? "pass" : "fail") as Status };
  });
  const failing = rows.filter((r) => r.status === "fail");
  add({
    id: "reaction",
    status: worst(rows.map((r) => r.status).filter((s) => s !== "skip")),
    summary:
      rows.map((r) => `${r.beat} ${r.status === "skip" ? "—" : r.latency === null ? "none" : `+${r.latency}`}`).join(", ") +
      ` (frames from each beat's first word to the first visible change; — = no cue on that word; limit ${checks.reactionFrames})`,
    details: rows,
    cites: failing.slice(0, 3).map((r) => ({ frame: r.frame + checks.reactionFrames, note: `${r.beat}: nothing visible changes by ${checks.reactionFrames} frames after its first word (f${r.frame})` })),
  });
}

// ---- Audio --------------------------------------------------------------------------
{
  const { lufs, lra, truePeak } = loudness(render);
  const { target, tolerance, maxTruePeak } = checks.loudness;
  const loudOk = Math.abs(lufs - target) <= tolerance && truePeak <= maxTruePeak;
  add({
    id: "loudness",
    status: loudOk ? "pass" : "fail",
    summary: `${lufs} LUFS integrated (target ${target} ±${tolerance}), true peak ${truePeak} dBTP (max ${maxTruePeak}), range ${lra} LU`,
  });

  const narration = pcm(join(episode, "narration.mp3"));
  const lag = renderPcm ? envelopeLag(narration, renderPcm) : NaN;
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

// ---- Loop ---------------------------------------------------------------------------
add(
  !loopPromised
    ? { id: "loop", status: "skip", summary: 'the storyboard promises no loop (no "loop": true, and the last endFrame mentions no first frame)' }
    : {
        id: "loop",
        status: (px.loopPixels ?? Infinity) <= checks.loopMaxPixels ? "pass" : "fail",
        summary: `${px.loopPixels} visual-zone pixels differ by more than ${checks.changeLevel} levels between the last and first frame (limit ${checks.loopMaxPixels})`,
        cites: (px.loopPixels ?? 0) > checks.loopMaxPixels ? [{ frame: 0, note: "first frame" }, { frame: px.frames - 1, note: "last frame" }] : [],
      },
);

// ---- Evidence and report -----------------------------------------------------------------
const evidence = join(episode, "check");
mkdirSync(evidence, { recursive: true });
for (const f of readdirSync(evidence)) if (f.endsWith(".png")) rmSync(join(evidence, f));
const ends: number[] = cues.beats.map((b: { endFrame: number }) => b.endFrame);
const cols = Math.min(ends.length, 5);
execFileSync("ffmpeg", [
  "-v", "error", "-y", "-i", render, "-vf",
  `select='${ends.map((f) => `eq(n\\,${f})`).join("+")}',crop=${VIDEO.width}:${zone.caption.bottom - zone.visual.top + 60}:0:${zone.visual.top - 30},scale=270:-1,tile=${cols}x${Math.ceil(ends.length / cols)}:padding=6`,
  "-frames:v", "1", "-fps_mode", "vfr", join(evidence, "sheet.png"),
]);
const CITES_PER_CHECK = 3;
for (const r of results) r.cites = r.cites?.slice(0, CITES_PER_CHECK);
const cited = results.filter((r) => r.status === "fail" || r.status === "warn").flatMap((r) => (r.cites ?? []).map((c) => ({ ...c, check: r.id })));
const citedFrames = [...new Set(cited.map((c) => c.frame))].sort((a, b) => a - b);
for (const f of citedFrames) {
  const boxes = cited
    .filter((c) => c.frame === f && c.box)
    .map((c) => `drawbox=x=${r0(c.box![0]) - 4}:y=${r0(c.box![1]) - 4}:w=${r0(c.box![2] - c.box![0]) + 8}:h=${r0(c.box![3] - c.box![1]) + 8}:color=red@0.9:t=3`);
  execFileSync("ffmpeg", [
    "-v", "error", "-y", "-i", render, "-vf", [`select='eq(n\\,${f})'`, ...boxes].join(","),
    "-frames:v", "1", "-fps_mode", "vfr", join(evidence, `f${String(f).padStart(4, "0")}.png`),
  ]);
}
const seconds = Math.round((Date.now() - started) / 100) / 10;
const counts = { fail: 0, warn: 0, pass: 0, skip: 0 };
for (const r of results) counts[r.status]++;
const verdict = counts.fail ? "fail" : "pass";
const rel = (f: number) => `check/f${String(f).padStart(4, "0")}.png`;
writeFileSync(
  join(episode, "check.json"),
  JSON.stringify(
    {
      episode: slug,
      render: "render.mp4",
      storyboardSha256,
      checkedAt: new Date().toISOString(),
      seconds,
      verdict,
      counts,
      contactSheet: "check/sheet.png",
      checks: results.map((r) => ({ ...r, cites: r.cites?.map((c) => ({ ...c, image: rel(c.frame) })) })),
    },
    null,
    1,
  ) + "\n",
);
const md = [
  `# Render check · ${slug}`,
  "",
  `**${verdict === "fail" ? "Fail" : "Pass"}**: ${counts.fail} fail, ${counts.warn} warn, ${counts.pass} pass, ${counts.skip} skip · ${seconds} s · contact sheet \`check/sheet.png\``,
  "",
  "| Check | Status | Summary |",
  "|---|---|---|",
  ...results.map((r) => `| ${r.id} | ${r.status} | ${r.summary.replace(/\|/g, "\\|")} |`),
  "",
  ...results
    .filter((r) => r.cites?.length && (r.status === "fail" || r.status === "warn"))
    .flatMap((r) => [`**${r.id}** (${r.status})`, "", ...r.cites!.map((c) => `- \`${rel(c.frame)}\`: ${c.note}`), ""]),
].join("\n");
writeFileSync(join(episode, "check.md"), md);
console.log(md);
process.exitCode = verdict === "fail" ? 1 : 0;
